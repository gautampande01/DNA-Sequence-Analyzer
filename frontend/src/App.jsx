import { useState } from 'react'
import {
  Container,
  Stack,
  Tabs,
  Grid,
  LoadingOverlay,
  SimpleGrid
} from '@mantine/core'
import {
  IconMicroscope,
  IconDna2,
  IconFlask,
  IconChartBar
} from '@tabler/icons-react'
import Header from './components/layout/Header'
import SequenceInputForm from './components/forms/SequenceInputForm'
import StatsCards from './components/cards/StatsCards'
import PrimerCard from './components/cards/PrimerCard'
import CopyableCode from './components/CopyableCode'
import MutationForm from './components/forms/MutationForm'
import { OrfResults, LiteratureResults, BlastResults } from './components/Tools'
import { useAnalysis } from './hooks/useAnalysis'
import MutationResults from './components/MutationResults'

function App() {
  const [activeTab, setActiveTab] = useState('analyze')
  
  const {
    // State
    results,
    loading,
    orfs,
    literatureResults,
    blastResults,
    mutationResults,
    
    // Actions
    analyzeSequence,
    analyzeMutation,
    findORFs,
    searchLiterature,
    blastPrimer
  } = useAnalysis()

  return (
    <div className="min-h-screen bg-gray-50">
      <Container size="xl" py="xl">
        <Stack gap="xl">
          <Header />

          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List grow>
              <Tabs.Tab value="analyze" leftSection={<IconMicroscope size="1rem" />}>
                Sequence Analysis
              </Tabs.Tab>
              <Tabs.Tab value="mutation" leftSection={<IconDna2 size="1rem" />}>
                Mutation Analysis
              </Tabs.Tab>
              <Tabs.Tab value="tools" leftSection={<IconFlask size="1rem" />}>
                Additional Tools
              </Tabs.Tab>
            </Tabs.List>

            {/* Sequence Analysis Tab */}
            <Tabs.Panel value="analyze" pt="md">
              <Grid>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <SequenceInputForm
                    onAnalyze={analyzeSequence}
                    onFindORFs={findORFs}
                    onSearchLiterature={searchLiterature}
                    loading={loading}
                  />
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
                  {results && (
                    <div style={{ position: 'relative' }}>
                      <LoadingOverlay visible={loading} />
                      
                      <StatsCards results={results} />

                      {/* Detailed Results */}
                      <Tabs defaultValue="overview">
                        <Tabs.List>
                          <Tabs.Tab value="overview" leftSection={<IconChartBar size="1rem" />}>
                            Overview
                          </Tabs.Tab>
                          <Tabs.Tab value="primers" leftSection={<IconFlask size="1rem" />}>
                            Primers
                          </Tabs.Tab>
                          <Tabs.Tab value="molecular" leftSection={<IconMicroscope size="1rem" />}>
                            Molecular Data
                          </Tabs.Tab>
                        </Tabs.List>

                        <Tabs.Panel value="overview" pt="md">
                          <Stack gap="md">
                            <CopyableCode
                              title="Cleaned Sequence"
                              value={results.cleaned_sequence}
                            />
                            <CopyableCode
                              title="Reverse Complement"
                              value={results.reverse_complement}
                            />
                          </Stack>
                        </Tabs.Panel>

                        <Tabs.Panel value="primers" pt="md">
                          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <PrimerCard
                              title="Forward Primer"
                              sequence={results.forward_primer}
                              stats={results.forward_primer_stats}
                              onBlast={blastPrimer}
                            />
                            <PrimerCard
                              title="Reverse Primer"
                              sequence={results.reverse_primer}
                              stats={results.reverse_primer_stats}
                              onBlast={blastPrimer}
                            />
                          </SimpleGrid>
                        </Tabs.Panel>

                        <Tabs.Panel value="molecular" pt="md">
                          <Stack gap="md">
                            <CopyableCode
                              title="Transcribed mRNA"
                              value={results.transcribed_mrna}
                            />
                            <CopyableCode
                              title="Translated Protein"
                              value={results.translated_protein}
                            />
                          </Stack>
                        </Tabs.Panel>
                      </Tabs>
                    </div>
                  )}
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            {/* Mutation Analysis Tab */}
            <Tabs.Panel value="mutation" pt="md">
              <MutationForm 
                onAnalyze={analyzeMutation}
                results={results}
              />
              
              <MutationResults mutationResults={mutationResults}/>
            </Tabs.Panel>

            {/* Additional Tools Tab */}
            <Tabs.Panel value="tools" pt="md">
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
                <OrfResults orfs={orfs} />
                <LiteratureResults literatureResults={literatureResults} />
                <BlastResults blastResults={blastResults} />
              </SimpleGrid>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
    </div>
  )
}

export default App