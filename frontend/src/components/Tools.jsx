import { Card, Title, Text, Stack, Paper, Code, Anchor } from '@mantine/core'

const OrfResults = ({ orfs }) => {
  if (!orfs) return null

  if (orfs.orfs_found === 0) {
    return (
      <Card shadow="sm">
        <Title order={4} mb="md">Open Reading Frames</Title>
        <Text>No valid ORFs found.</Text>
      </Card>
    )
  }

  return (
    <Card shadow="sm">
      <Title order={4} mb="md">Open Reading Frames</Title>
      <Text mb="md">Found {orfs.orfs_found} ORFs</Text>
      <div className="overflow-y-auto max-h-96">
        <Stack gap="md">
          {orfs.orfs.map((orf, index) => (
            <Paper key={index} p="md" bg="gray.0">
              <Text fw={500} mb="xs">
                ORF {index + 1}: Start at {orf.start}, End at {orf.end}, Length: {orf.length} bp
              </Text>
              
              <div>
                <Text size="sm" fw={500} mb="xs">DNA Sequence:</Text>
                <Code block className="font-mono text-sm mb-md">{orf.sequence}</Code>
              </div>
              
              <div>
                <Text size="sm" fw={500} mb="xs">Protein Sequence:</Text>
                <Code block className="font-mono text-sm">{orf.protein}</Code>
              </div>
            </Paper>
          ))}
        </Stack>
      </div>
    </Card>
  )
}


const BlastResults = ({ blastResults }) => {
  if (!blastResults || blastResults.length === 0) return null

  return (
    <Card shadow="sm">
      <Title order={4} mb="md">BLAST Results ({blastResults.length})</Title>
      <Stack gap="sm">
        {blastResults.map((result, index) => (
          <Paper key={index} p="sm" bg="gray.0">
            <Text size="xs" c="dimmed">Primer: {result.sequence?.slice(0, 10)}...</Text>
            {result.status === 'success' ? (
              <Stack gap="xs">
                <Text size="sm"><strong>RID:</strong> {result.rid}</Text>
                <Anchor href={result.result_url} target="_blank" size="sm">
                  View BLAST Results 🔗
                </Anchor>
              </Stack>
            ) : (
              <Text c="red" size="sm">BLAST request failed</Text>
            )}
          </Paper>
        ))}
      </Stack>
    </Card>
  )
}

const LiteratureResults = ({ literatureResults }) => {
  if (!literatureResults) return null

  return (
    <Card shadow="sm">
      <Title order={4} mb="md">Literature Results</Title>
      <Text size="sm" c="dimmed">
        Status: {literatureResults.status}
      </Text>
      {literatureResults.results && (
        <Text size="sm">
          Found {literatureResults.count} publications
        </Text>
      )}
    </Card>
  )
}

export { 
  OrfResults,
  BlastResults,
  LiteratureResults
}