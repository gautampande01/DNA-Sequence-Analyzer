# DNA Sequence Analyzer
# By Gautam Pande
# This Script analyses a DNA sequence and returns:
# - Cleaned sequences
# - Length
# - GC content
# - Reverse complement
# - Transcribed mRNA sequence
# - Forward and Reverse Primer
# - Mutation in primer
# - PubMed Literature Search

import requests
import re

try:
    from Bio import Entrez
    BIO_AVAILABLE = True
except ImportError:
    BIO_AVAILABLE = False

# --------------------------
# --- Clean Sequence
# --------------------------
def clean_sequence(seq):
    return ''.join([base for base in seq.upper() if base in 'ATGC'])

# --------------------------
# --- GC Content
# --------------------------
def gc_content(seq):
    g = seq.count('G')
    c = seq.count('C')
    return round(((g + c) / len(seq)) * 100, 2)

# --------------------------
# --- Reverse Complement
# --------------------------
def reverse_complement(seq):
    complement = {'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G'}
    return ''.join([complement[base] for base in reversed(seq)])

# --------------------------
# --- Transcription
# --------------------------
def transcribe(seq):
    return seq.replace('T', 'U')

# --------------------------
# --- Translation
# --------------------------
def translate_dna(seq):
    codon_table = {
        'ATA':'I', 'ATC':'I', 'ATT':'I', 'ATG':'M',
        'ACA':'T', 'ACC':'T', 'ACG':'T', 'ACT':'T',
        'AAC':'N', 'AAT':'N', 'AAA':'K', 'AAG':'K',
        'AGC':'S', 'AGT':'S', 'AGA':'R', 'AGG':'R',
        'CTA':'L', 'CTC':'L', 'CTG':'L', 'CTT':'L',
        'CCA':'P', 'CCC':'P', 'CCG':'P', 'CCT':'P',
        'CAC':'H', 'CAT':'H', 'CAA':'Q', 'CAG':'Q',
        'CGA':'R', 'CGC':'R', 'CGG':'R', 'CGT':'R',
        'GTA':'V', 'GTC':'V', 'GTG':'V', 'GTT':'V',
        'GCA':'A', 'GCC':'A', 'GCG':'A', 'GCT':'A',
        'GAC':'D', 'GAT':'D', 'GAA':'E', 'GAG':'E',
        'GGA':'G', 'GGC':'G', 'GGG':'G', 'GGT':'G',
        'TCA':'S', 'TCC':'S', 'TCG':'S', 'TCT':'S',
        'TTC':'F', 'TTT':'F', 'TTA':'L', 'TTG':'L',
        'TAC':'Y', 'TAT':'Y', 'TAA':'_', 'TAG':'_', 'TGA':'_'
    }

    protein = ""
    for i in range(0, len(seq) - 2, 3):
        codon = seq[i:i+3]
        amino_acid = codon_table.get(codon, '?')
        if amino_acid == '_':
            break
        protein += amino_acid
    return protein

# --------------------------
# --- Primer Generator
# --------------------------
def get_primers(seq, primer_len=20):
    if len(seq) < primer_len:
        return ("Sequence too short", "Sequence too short")
    forward = seq[:primer_len]
    reverse = reverse_complement(seq[-primer_len:])
    return forward, reverse

# --------------------------
# --- Primer Stats
# --------------------------
def primer_stats(primer):
    gc = gc_content(primer)
    length = len(primer)
    a = primer.count('A')
    t = primer.count('T')
    g = primer.count('G')
    c = primer.count('C')
    tm = 2 * (a + t) + 4 * (g + c)

    quality = "Good"
    if length < 18 or length > 25:
        quality = "Check Length"
    if gc < 40 or gc > 60:
        quality = "GC% Out of Range"
    if tm < 50 or tm > 65:
        quality = "Tm Out of Range"

    return gc, tm, quality

# --------------------------
# --- BLAST Function
# --------------------------
def blast_primer(primer_seq):
    headers = {
        'User-Agent': 'GautamPandey-DNAAnalyzer/1.0 (pandegautam01@gmail.com)'
    }

    blast_url = "https://blast.ncbi.nlm.nih.gov/Blast.cgi"
    params = {
        "CMD": "Put",
        "PROGRAM": "blastn",
        "DATABASE": "nt",
        "QUERY": primer_seq,
        "MEGABLAST": "on"
    }

    response = requests.post(blast_url, data=params, headers=headers)
    if "RID =" not in response.text:
        return {"status": "failed", "message": "BLAST request failed. Try again later."}

    rid = response.text.split("RID = ")[1].split("\n")[0].strip()
    blast_result_url = f"https://blast.ncbi.nlm.nih.gov/Blast.cgi?CMD=Get&RID={rid}"
    return {"status": "success", "rid": rid, "result_url": blast_result_url}

# --------------------------
# --- Mutation Scanner
# --------------------------
def scan_for_mutation(sequence, f_primer, r_primer, mutation_input):
    if not mutation_input:
        return None

    match = re.match(r"([ATGC])>([ATGC]) at position (\d+)", mutation_input)
    if not match:
        return {"status": "error", "message": "Invalid format. Please use format like: A>G at position 45"}

    original_base, new_base, pos = match.groups()
    pos = int(pos) - 1

    if pos >= len(sequence):
        return {
            "status": "error",
            "message": f"Position {pos+1} is out of range for the sequence of length {len(sequence)}"
        }

    if sequence[pos] != original_base:
        return {
            "status": "error",
            "message": f"Mismatch at position {pos+1}. Found '{sequence[pos]}' instead of expected '{original_base}'"
        }

    before = sequence[:pos]
    after = sequence[pos+1:]
    mutated_seq = before + new_base + after

    mutation_location = "outside primer regions"
    if pos < len(f_primer):
        mutation_location = "inside the Forward Primer"
    elif pos >= len(sequence) - len(r_primer):
        mutation_location = "inside the Reverse Primer region"

    return {
        "status": "success",
        "position": pos+1,
        "original_base": original_base,
        "new_base": new_base,
        "original_sequence": before + "[" + original_base + "]" + after,
        "mutated_sequence": mutated_seq,
        "location": mutation_location
    }

def display_sequence_with_positions(seq, chunk_size=10):
    result = []
    for i in range(0, len(seq), chunk_size):
        chunk = seq[i:i+chunk_size]
        positions = ''.join(f"{(i+j+1)%10}" for j in range(len(chunk)))
        result.append((chunk, positions))
    return result

# --------------------------
# --- Literature Search (PubMed Only)
# --------------------------
def search_literature_by_sequence(seq, max_results=5, email="pandegautam01@gmail.com"):
    if not BIO_AVAILABLE:
        return {"status": "error", "message": "Bio library not available"}
    
    Entrez.email = email

    try:
        handle = Entrez.esearch(db="pubmed", term=seq, retmax=max_results)
        record = Entrez.read(handle)
        handle.close()

        id_list = record.get("IdList", [])
        results = []

        if id_list:
            for pubmed_id in id_list:
                summary_handle = Entrez.esummary(db="pubmed", id=pubmed_id)
                summary = Entrez.read(summary_handle)[0]
                results.append({
                    'id': pubmed_id,
                    'title': summary.get('Title', 'No Title'),
                    'url': f"https://pubmed.ncbi.nlm.nih.gov/{pubmed_id}/"
                })
                summary_handle.close()

        return {"status": "success", "count": len(results), "results": results}

    except Exception as e:
        return {"status": "error", "message": str(e)}

# --- ORF Finder ----
def find_orfs_with_translation(seq):
    start_codon = 'ATG'
    stop_codons = {'TAA', 'TAG', 'TGA'}
    orfs = []

    for frame in range(3):  # check all 3 forward frames
        i = frame
        while i < len(seq) - 2:
            codon = seq[i:i+3]
            if codon == start_codon:
                for j in range(i + 3, len(seq) - 2, 3):
                    stop_codon = seq[j:j+3]
                    if stop_codon in stop_codons:
                        orf_seq = seq[i:j+3]
                        protein = translate_dna(orf_seq)
                        orfs.append({
                            'start': i + 1,       # 1-based index
                            'end': j + 3,
                            'length': j + 3 - i,
                            'sequence': orf_seq,
                            'protein': protein
                        })
                        break
                i += 3  # skip overlapping ORFs in same frame
            else:
                i += 3
    return orfs


if __name__ == "__main__":
    # --------------------------
    # --- Get Primer Length!
    # --------------------------
    try:
        primer_len = int(input("Enter primer length (default 20): ") or "20")
    except ValueError:
        primer_len = 20

    # --------------------------
    # --- Ask for DNA Input
    # --------------------------
    dna_input = input("Enter your DNA sequence: ")

    sequence = clean_sequence(dna_input)
    print("\nCleaned DNA sequence:", sequence)
    print("Length:", len(sequence))

    print("GC Content:", gc_content(sequence), "%")

    print("Reverse Complement:", reverse_complement(sequence))

    print("Transcribed mRNA:", transcribe(sequence))

    print("Translated Protein Sequence:", translate_dna(sequence))

    # --------------------------
    # --- Print Primers & Stats
    # --------------------------
    f_primer, r_primer = get_primers(sequence, primer_len)

    f_gc, f_tm, f_quality = primer_stats(f_primer)
    r_gc, r_tm, r_quality = primer_stats(r_primer)

    print("\nForward Primer:", f_primer)
    print("  GC%:", f_gc, "| Tm:", f_tm, "C |", f_quality)

    print("Reverse Primer:", r_primer)
    print("  GC%:", r_gc, "| Tm:", r_tm, "C |", r_quality)

    # --------------------------
    # --- BLAST Output
    # --------------------------
    f_blast = blast_primer(f_primer)
    r_blast = blast_primer(r_primer)
    
    print(f"\nBLASTing forward primer: {f_primer}")
    if f_blast["status"] == "success":
        print(" Submitting BLAST request...")
        print(f"  Request submitted. Your RID is: {f_blast['rid']}")
        print(f"➡️  Open this link in your browser to see results:\n{f_blast['result_url']}")
    else:
        print("  BLAST request failed. Try again later.")

    print(f"\nBLASTing reverse primer: {r_primer}")
    if r_blast["status"] == "success":
        print(" Submitting BLAST request...")
        print(f"  Request submitted. Your RID is: {r_blast['rid']}")
        print(f"➡️  Open this link in your browser to see results:\n{r_blast['result_url']}")
    else:
        print("  BLAST request failed. Try again later.")

    # --------------------------
    # --- Display sequence with positions
    # --------------------------
    sequence_display = display_sequence_with_positions(sequence)
    print("\nDNA Sequence with Positions:")
    for chunk, positions in sequence_display:
        print(chunk)
        print(positions)

    # --------------------------
    # --- Mutation Scanner
    # --------------------------
    print("\nMutation Marker Scanner")
    print("Example format: A>G at position 45")

    user_input = input("Enter your mutation (or press Enter to skip): ").strip()
    mutation_result = scan_for_mutation(sequence, f_primer, r_primer, user_input)
    
    if mutation_result:
        if mutation_result["status"] == "success":
            print("\nMutation recognized.")
            print(f"Position: {mutation_result['position']} | Original: {mutation_result['original_base']} | Mutated: {mutation_result['new_base']}")
            print("\nOriginal Sequence:")
            print(mutation_result["original_sequence"])
            print("\nMutated Sequence:")
            print(mutation_result["mutated_sequence"])
            print(f"Mutation is {mutation_result['location']}.")
        else:
            print(mutation_result["message"])

    # --------------------------
    # --- Literature Search
    # --------------------------
    literature_results = search_literature_by_sequence(sequence)
    print(f"\n Searching PubMed for sequence:\n {sequence}")
    
    if literature_results["status"] == "success":
        if literature_results["count"] > 0:
            print(" PubMed Hits Found:", literature_results["count"])
            for result in literature_results["results"]:
                print(f"- {result['title']}")
                print(f"  {result['url']}")
        else:
            print(" No matches found in PubMed.")
    else:
        print("PubMed search failed:", literature_results["message"])

    # --------------------------
    # --- Display ORFs
    # --------------------------
    print("\nDetected Open Reading Frames (ORFs):")
    orfs = find_orfs_with_translation(sequence)

    if not orfs:
        print("No valid ORFs found.")
    else:
        for idx, orf in enumerate(orfs, 1):
            print(f"\nORF {idx}: Start at {orf['start']}, End at {orf['end']}, Length: {orf['length']} bp")
            print("DNA Sequence:", orf['sequence'])
            print("Protein Sequence:", orf['protein'])