import { Paper, Group, Title, Text } from '@mantine/core'
import { IconDna } from '@tabler/icons-react'

const Header = () => {
  return (
    <Paper p="xl" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
      <Group justify="center" gap="md">
        <IconDna size={40} />
        <div className="text-center">
          <Title order={1} size="h1" mb="xs">DNA Sequence Analyzer</Title>
          <Text size="lg">Comprehensive molecular biology analysis tools</Text>
        </div>
      </Group>
    </Paper>
  )
}

export default Header