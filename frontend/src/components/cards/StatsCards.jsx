import { SimpleGrid, Paper, Text, Badge } from '@mantine/core'

const StatsCards = ({ results }) => {
  if (!results) return null

  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} mb="md">
      <Paper p="md" className="border-l-4 border-blue-500">
        <Text size="xs" c="dimmed">Length</Text>
        <Text size="xl" fw={700}>{results.length}</Text>
      </Paper>
      
      <Paper p="md" className="border-l-4 border-green-500">
        <Text size="xs" c="dimmed">GC Content</Text>
        <Text size="xl" fw={700}>{results.gc_content}%</Text>
      </Paper>

      <Paper p="md" className="border-l-4 border-purple-500">
        <Text size="xs" c="dimmed">Protein</Text>
        <Text size="xl" fw={700}>{results.translated_protein.length}</Text>
      </Paper>

      <Paper p="md" className="border-l-4 border-orange-500">
        <Text size="xs" c="dimmed">mRNA</Text>
        <Text size="xl" fw={700}>{results.transcribed_mrna.length}</Text>
      </Paper>
    </SimpleGrid>
  )
}

export default StatsCards