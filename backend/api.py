from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from pathlib import Path
from pydantic import BaseModel, Field, validator
from typing import Optional
from analyzer import (clean_sequence, gc_content, reverse_complement, transcribe, 
                      translate_dna, get_primers, primer_stats, blast_primer, 
                      search_literature_by_sequence, find_orfs_with_translation, 
                      display_sequence_with_positions,
                      scan_for_mutation)

app = FastAPI(
    title="DNA Sequence Analysis API",
    description="API for analyzing DNA sequences with various functionalities such as cleaning, " \
        "GC content calculation, reverse complement, and more.",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://gautampande01.github.io/DNA-Sequence-Analyzer/",  
    ],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],  
)

class SequenceRequest(BaseModel):
    sequence: str = Field(..., 
                          description="The DNA sequence to analyze.", 
                          min_length=1)
    primer_length: Optional[int] = Field(20, 
                                         description="Length of the primers to generate.")
    
    @validator("sequence")
    def validate_sequence(cls, v):
        if not v or not any(base in v.upper() for base in "ACGT"):
            raise ValueError("Sequence must contain valid DNA bases (A, C, G, T).")
        return v
    
class MutationRequest(BaseModel):
    sequence: str = Field(..., 
                          description="Original DNA sequence.")
    forward_primer: str = Field(..., 
                                description="Forward primer sequence.")
    reverse_primer: str = Field(..., 
                                description="Reverse primer sequence.")
    mutation: str = Field(..., 
                          description="Mutation in format 'A>G at position 45'")
    
class PrimerStatsResponse(BaseModel):
    gc_content: float
    tm: float
    quality: str


@app.get("/")
async def root():
    """Welcome message and API info."""
    return {
        "message": "DNA Sequence Analysis API",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/analyze - Complete sequence analysis",
            "mutation": "/mutation - Mutation analysis", 
            "blast": "/blast - BLAST primer sequences",
            "literature": "/literature - Search literature",
            "orfs": "/orfs - Find Open Reading Frames"
        },
        "docs": "/docs"
    }


@app.get("/analyze")
async def analysis(
    sequence: str = Query(..., 
                          description="The DNA sequence to analyze.", 
                          min_length=1),
    primer_length: int = Query(20, 
                               description="Primer length"),  
):
    """Analyze DNA sequence with desired functionalities."""
    try:
        cleaned_sequence = clean_sequence(sequence)
        if not cleaned_sequence:
            raise HTTPException(status_code=400, detail="No valid DNA sequence found.")
        
        gc = gc_content(cleaned_sequence)
        rev_comp = reverse_complement(cleaned_sequence)
        transcribed_mrna = transcribe(cleaned_sequence)
        translated_protein = translate_dna(cleaned_sequence)
        forward_primer, reverse_primer = get_primers(cleaned_sequence, primer_length)
        display_sequence = display_sequence_with_positions(cleaned_sequence)
        f_gc, f_tm, f_quality = primer_stats(forward_primer)
        r_gc, r_tm, r_quality = primer_stats(reverse_primer)

        results = {
            "original_input": sequence,
            "cleaned_sequence": cleaned_sequence,
            "length": len(cleaned_sequence),
            "gc_content": gc,
            "reverse_complement": rev_comp,
            "transcribed_mrna": transcribed_mrna,
            "translated_protein": translated_protein,
            "forward_primer": forward_primer,
            "reverse_primer": reverse_primer,
            "display_sequence": display_sequence,
            "forward_primer_stats": {
                "gc_content": f_gc,
                "tm": f_tm, 
                "quality": f_quality
            },
            "reverse_primer_stats": {
                "gc_content": r_gc,
                "tm": r_tm,
                "quality": r_quality
            }
        }

        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/mutation")
async def mutation_analysis(request: MutationRequest):
    """Analyze mutation in a DNA sequence."""
    try:
        sequence = request.sequence
        mutation = request.mutation
        f_primer = request.forward_primer
        r_primer = request.reverse_primer
        
        cleaned_sequence = clean_sequence(sequence)
        if not cleaned_sequence:
            raise HTTPException(status_code=400, detail="No valid DNA sequence found.")
        
        mutation_result = scan_for_mutation(cleaned_sequence, f_primer, r_primer, mutation)
        
        if not mutation_result:
            return {"message": "No mutation analysis performed"}
        
        return mutation_result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/blast")
async def blast_primer_endpoint(
    sequence: str = Query(..., 
                          description="The primer sequence to BLAST.", 
                          min_length=1)
):
    """BLAST a primer sequence against the NCBI database."""
    try:
        results = blast_primer(sequence)
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/literature")
async def literature_search(
    sequence: str = Query(..., 
                          description="The DNA sequence to search in literature.", 
                          min_length=1)
):
    """Search literature for a given DNA sequence."""
    try:
        results = search_literature_by_sequence(sequence)
        return results
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/orfs")
async def orf_search(
    sequence: str = Query(..., 
                          description="The DNA sequence to find ORFs.", 
                          min_length=1)
):
    """Find Open Reading Frames (ORFs) in a DNA sequence."""
    try:
        cleaned_sequence = clean_sequence(sequence)
        if not cleaned_sequence:
            raise HTTPException(status_code=400, detail="No valid DNA sequence found.")
            
        orfs = find_orfs_with_translation(cleaned_sequence)
        return {
            "sequence": cleaned_sequence,
            "orfs_found": len(orfs),
            "orfs": orfs
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)