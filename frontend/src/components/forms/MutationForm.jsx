import { Card, Title, SimpleGrid, TextInput, Button } from '@mantine/core'
import { useForm } from '@mantine/form'
import { IconDna2 } from '@tabler/icons-react'
import { useEffect } from 'react'

const MutationForm = ({ onAnalyze, results }) => {
  const form = useForm({
    initialValues: {
      sequence: '',
      forward_primer: '',
      reverse_primer: '',
      mutation: ''
    },
    validate: {
      sequence: (value) => (!value.trim() ? 'Sequence is required' : null),
      forward_primer: (value) => (!value.trim() ? 'Forward primer is required' : null),
      reverse_primer: (value) => (!value.trim() ? 'Reverse primer is required' : null),
      mutation: (value) => {
        if (!value.trim()) return 'Mutation is required'
        if (!/^[ATGC]>[ATGC] at position \d+$/i.test(value)) {
          return 'Mutation format should be: A>G at position 5'
        }
        return null
      }
    }
  })

  // Auto-populate form when sequence analysis results are available
  useEffect(() => {
    if (results) {
      form.setFieldValue('sequence', results.cleaned_sequence)
      form.setFieldValue('forward_primer', results.forward_primer)
      form.setFieldValue('reverse_primer', results.reverse_primer)
    }
  }, [results])

  const handleSubmit = (values) => {
    onAnalyze(values)
  }

  return (
    <Card shadow="sm" padding="lg">
      <Title order={3} mb="md">🔬 Mutation Analysis</Title>
      
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label="Original Sequence"
            placeholder="ATGCGT..."
            styles={{ input: { fontFamily: 'monospace' } }}
            {...form.getInputProps('sequence')}
          />
          
          <TextInput
            label="Mutation (e.g., A>G at position 5)"
            placeholder="A>G at position 5"
            {...form.getInputProps('mutation')}
          />
          
          <TextInput
            label="Forward Primer"
            placeholder="ATGCGT..."
            styles={{ input: { fontFamily: 'monospace' } }}
            {...form.getInputProps('forward_primer')}
          />
          
          <TextInput
            label="Reverse Primer"
            placeholder="ATGCGT..."
            styles={{ input: { fontFamily: 'monospace' } }}
            {...form.getInputProps('reverse_primer')}
          />
        </SimpleGrid>
        
        <Button
          type="submit"
          leftSection={<IconDna2 size="1rem" />}
          mt="md"
          fullWidth
        >
          Analyze Mutation
        </Button>
      </form>
    </Card>
  )
}

export default MutationForm