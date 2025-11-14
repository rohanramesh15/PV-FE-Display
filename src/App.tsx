import { Box, Container, Heading, Stack, Text, Badge } from '@chakra-ui/react'
import { useState, useEffect } from 'react'

const API_BASE_URL = 'http://127.0.0.1:5000/api'
const POLL_INTERVAL = 1000 // Poll every 1 second

interface Scores {
  team1: number
  team2: number
}

function App() {
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0 })
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isConnected, setIsConnected] = useState<boolean>(true)

  const fetchScores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scores`)

      if (!response.ok) {
        throw new Error('Failed to fetch scores')
      }

      const data = await response.json()
      setScores(data)
      setLastUpdate(new Date())
      setIsConnected(true)
    } catch (error) {
      console.error('Error fetching scores:', error)
      setIsConnected(false)
    }
  }

  useEffect(() => {
    // Fetch immediately on mount
    fetchScores()

    // Set up polling interval
    const interval = setInterval(fetchScores, POLL_INTERVAL)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [])

  return (
    <Container maxW="container.xl" py={10}>
      <Stack gap={8}>
        <Box textAlign="center">
          <Heading size="2xl" mb={2}>
            Live Score Display
          </Heading>
          <Badge colorScheme={isConnected ? 'green' : 'red'} fontSize="md">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Text fontSize="sm" color="gray.500" mt={2}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </Text>
        </Box>

        <Stack direction="row" gap={10} justify="center">
          {/* Team 1 Display */}
          <Box
            p={10}
            borderWidth="4px"
            borderRadius="xl"
            borderColor="blue.500"
            bg="blue.50"
            minW="350px"
            textAlign="center"
            boxShadow="xl"
          >
            <Stack gap={4}>
              <Heading size="xl" color="blue.700">
                Team 1
              </Heading>
              <Text fontSize="8xl" fontWeight="bold" color="blue.800">
                {scores.team1}
              </Text>
            </Stack>
          </Box>

          {/* Team 2 Display */}
          <Box
            p={10}
            borderWidth="4px"
            borderRadius="xl"
            borderColor="red.500"
            bg="red.50"
            minW="350px"
            textAlign="center"
            boxShadow="xl"
          >
            <Stack gap={4}>
              <Heading size="xl" color="red.700">
                Team 2
              </Heading>
              <Text fontSize="8xl" fontWeight="bold" color="red.800">
                {scores.team2}
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Stack>
    </Container>
  )
}

export default App
