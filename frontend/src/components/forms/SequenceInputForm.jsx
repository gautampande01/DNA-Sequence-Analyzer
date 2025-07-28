import { Card, Group, Text, Badge, Stack, Textarea, TextInput, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconDna, IconDna2, IconSearch } from '@tabler/icons-react'

const SequenceInputForm = ({ 
  onAnalyze, 
  onFindORFs, 
  onSearchLiterature, 
  loading 
}) => {
  const form = useForm({
    initialValues: {
      sequence: '',
      primer_length: 20
    },
    validate: {
      sequence: (value) => {
        if (!value.trim()) return 'DNA sequence is required'
        return null
      },
      primer_length: (value) => {
        if (value < 10 || value > 50) return 'Primer length must be between 10 and 50'
        return null
      }
    }
  })

  const handleAnalyze = (values) => {
    onAnalyze(values)
  }

  const handleFindORFs = () => {
    onFindORFs(form.values.sequence)
  }

  const handleSearchLiterature = () => {
    onSearchLiterature(form.values.sequence)
  }

  return (
    <Card shadow="sm" padding="lg">
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Text fw={500}>Input Sequence</Text>
          <Badge variant="light" color="blue">
            {form.values.sequence.length} bp
          </Badge>
        </Group>
      </Card.Section>

      <form onSubmit={form.onSubmit(handleAnalyze)}>
        <Stack gap="md" mt="md">
          <Textarea
            label="DNA Sequence"
            placeholder="Enter your DNA sequence (ATGC...)"
            rows={6}
            styles={{ input: { fontFamily: 'monospace' } }}
            {...form.getInputProps('sequence')}
          />

          <div>
            <Text size="sm" fw={500} mb="xs">
              Primer Length:
            </Text>
            <TextInput
              type="number"
              placeholder="20"
              {...form.getInputProps('primer_length')}
              styles={{ input: { fontFamily: 'monospace' } }}
            />
          </div>

          <Group grow>
            <Button
              type="submit"
              leftSection={<IconDna size="1rem" />}
              loading={loading}
              size="md"
            >
              Analyze Sequence
            </Button>
          </Group>

          <Group grow>
            <Button
              variant="light"
              leftSection={<IconDna2 size="1rem" />}
              onClick={handleFindORFs}
              disabled={!form.values.sequence.trim()}
            >
              Find ORFs
            </Button>
            <Button
              variant="light"
              leftSection={<IconSearch size="1rem" />}
              onClick={handleSearchLiterature}
              disabled={!form.values.sequence.trim()}
            >
              Literature
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  )
}

export default SequenceInputForm