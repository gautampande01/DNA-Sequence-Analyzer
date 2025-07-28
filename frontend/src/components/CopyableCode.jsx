import { Group, Text, Code, ActionIcon, CopyButton, Tooltip } from '@mantine/core'
import { IconCheck, IconCopy } from '@tabler/icons-react'

const CopyableCode = ({ title, value, className = "font-mono text-sm" }) => {
  return (
    <div>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{title}</Text>
        <CopyButton value={value}>
          {({ copied, copy }) => (
            <Tooltip label={copied ? 'Copied' : 'Copy'}>
              <ActionIcon 
                color={copied ? 'teal' : 'gray'} 
                variant="subtle" 
                onClick={copy}
              >
                {copied ? <IconCheck size="1rem" /> : <IconCopy size="1rem" />}
              </ActionIcon>
            </Tooltip>
          )}
        </CopyButton>
      </Group>
      <Code block className={className}>{value}</Code>
    </div>
  )
}

export default CopyableCode