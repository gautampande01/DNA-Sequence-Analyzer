import { Card, Group, Text, Button, Code, Stack, Badge } from '@mantine/core'

const getQualityColor = (quality) => {
  switch (quality) {
    case 'Good': return 'green'
    case 'Check Length': return 'yellow'
    case 'GC% Out of Range': return 'orange'
    case 'Tm Out of Range': return 'red'
    default: return 'gray'
  }
}

const PrimerCard = ({ 
  title, 
  sequence, 
  stats, 
  onBlast,
  icon = "🧬" 
}) => {
  return (
    <Card shadow="xs">
      <Group justify="space-between" mb="md">
        <Text fw={500}>{icon} {title}</Text>
        <Button
          size="xs"
          variant="light"
          onClick={() => onBlast(sequence)}
        >
          BLAST
        </Button>
      </Group>
      
      <Code block className="font-mono text-sm mb-md">
        {sequence}
      </Code>
      
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm">GC Content:</Text>
          <Badge variant="light">{stats.gc_content}%</Badge>
        </Group>
        <Group justify="space-between">
          <Text size="sm">Tm:</Text>
          <Badge variant="light">{stats.tm}°C</Badge>
        </Group>
        <Group justify="space-between">
          <Text size="sm">Quality:</Text>
          <Badge color={getQualityColor(stats.quality)}>
            {stats.quality}
          </Badge>
        </Group>
      </Stack>
    </Card>
  )
}

export default PrimerCard