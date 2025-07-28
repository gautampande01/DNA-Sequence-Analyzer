import { 
  Card, 
  Title, 
  Text,
  Stack, 
  Alert,
  Code
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import CopyableCode from './CopyableCode'

const MutationResults = ({ mutationResults }) => {
  if (!mutationResults) return null

  if (mutationResults.status === 'error') {
    return (
      <Card shadow="sm" padding="lg" mt="md">
        <Alert 
          icon={<IconAlertCircle size="1rem" />} 
          title="Mutation Analysis Failed" 
          color="red"
        >
          {mutationResults.message}
        </Alert>
      </Card>
    )
  }

  const { position, original_base, new_base, location } = mutationResults
  
  const mutationDetails = [
    `Position: ${position}`,
    `Original Base: ${original_base}`,
    `New Base: ${new_base}`,
    `Location: ${location}`
  ].join('\n')

  if (mutationResults.status === 'success') {
    return (
      <Card shadow="sm" padding="lg" mt="md">
        <Title order={3} mb="md">Mutation Results</Title>
        
        <Stack gap="md">
        
          <CopyableCode 
            value={mutationResults.original_sequence}
            title={'Original Sequence:'} />

          <CopyableCode 
            value={mutationResults.mutated_sequence} 
            title={'Mutated Sequence:'} />
          
          <CopyableCode 
            value={mutationDetails} 
            title={'Mutation Details:'} />

        </Stack>
      </Card>
    )
  }

  return null
}

export default MutationResults