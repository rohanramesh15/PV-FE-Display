import { Box, Container, Heading, Stack, Text, Badge, Image, Flex, Button, HStack } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import performer1 from './assets/performer1.png'
import performer2 from './assets/performer2.png'

const API_BASE_URL = "https://d173ae86c0fb.ngrok-free.app/api"
//'https://pv-be-q7m9.onrender.com/api'
const POLL_INTERVAL = 1000 // Poll every 1 second

interface Scores {
  team1: number
  team2: number
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
}

const MotionBox = motion.create(Box)

function App() {
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0 })
  const [prevScores, setPrevScores] = useState<Scores>({ team1: 0, team2: 0 })
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [team1Particles, setTeam1Particles] = useState<Particle[]>([])
  const [team2Particles, setTeam2Particles] = useState<Particle[]>([])
  const [team1AnimKey, setTeam1AnimKey] = useState(0)
  const [team2AnimKey, setTeam2AnimKey] = useState(0)
  const [team1Scale, setTeam1Scale] = useState(1)
  const [team2Scale, setTeam2Scale] = useState(1)
  const [team1BarScale, setTeam1BarScale] = useState(1)
  const [team2BarScale, setTeam2BarScale] = useState(1)
  const particleIdRef = useRef(0)
  const team1LastVoteTime = useRef<number>(0)
  const team2LastVoteTime = useRef<number>(0)

  const fetchScores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scores`)
      console.log(response)

      if (!response.ok) {
        throw new Error('Failed to fetch scores')
      }

      const data = await response.json()
      setPrevScores(scores)
      setScores(data)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Trigger particle effects and animations when scores change
  useEffect(() => {
    if (scores.team1 > prevScores.team1) {
      const now = Date.now()
      const timeSinceLastVote = now - team1LastVoteTime.current

      createParticles('team1')
      setTeam1AnimKey(prev => prev + 1)

      // If within 0.5 seconds, add to the scale, otherwise reset
      if (timeSinceLastVote < 500 && team1LastVoteTime.current > 0) {
        const newScale = Math.min(team1Scale + 0.15, 1.6)
        setTeam1Scale(newScale) // Cap at 1.6x
        setTeam1BarScale(newScale) // Use same scale for bar
      } else {
        setTeam1Scale(1.3)
        setTeam1BarScale(1.3) // Use same scale for bar
      }

      team1LastVoteTime.current = now

      // Reset scale after animation completes
      setTimeout(() => {
        setTeam1Scale(1)
        setTeam1BarScale(1)
      }, 600)
    }

    if (scores.team2 > prevScores.team2) {
      const now = Date.now()
      const timeSinceLastVote = now - team2LastVoteTime.current

      createParticles('team2')
      setTeam2AnimKey(prev => prev + 1)

      // If within 0.5 seconds, add to the scale, otherwise reset
      if (timeSinceLastVote < 500 && team2LastVoteTime.current > 0) {
        const newScale = Math.min(team2Scale + 0.15, 1.6)
        setTeam2Scale(newScale) // Cap at 1.6x
        setTeam2BarScale(newScale) // Use same scale for bar
      } else {
        setTeam2Scale(1.3)
        setTeam2BarScale(1.3) // Use same scale for bar
      }

      team2LastVoteTime.current = now

      // Reset scale after animation completes
      setTimeout(() => {
        setTeam2Scale(1)
        setTeam2BarScale(1)
      }, 600)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores.team1, scores.team2])

  const createParticles = (team: 'team1' | 'team2') => {
    const newParticles: Particle[] = []
    const colors = team === 'team1'
      ? ['#3182ce', '#63b3ed', '#4299e1', '#2c5282']
      : ['#e53e3e', '#fc8181', '#f56565', '#c53030']

    for (let i = 0; i < 15; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    if (team === 'team1') {
      setTeam1Particles(newParticles)
      setTimeout(() => setTeam1Particles([]), 1000)
    } else {
      setTeam2Particles(newParticles)
      setTimeout(() => setTeam2Particles([]), 1000)
    }
  }

  const totalVotes = scores.team1 + scores.team2
  const team1Percentage = totalVotes === 0 ? 0 : (scores.team1 / totalVotes) * 100
  const team2Percentage = totalVotes === 0 ? 0 : (scores.team2 / totalVotes) * 100

  return (
    <Box
      minH="100vh"
      bg="gray.900"
      py={10}
      px={6}
      position="relative"
    >
      {/* Background Flash Overlay */}
      <AnimatePresence>
        {team1AnimKey > 0 && scores.team1 > prevScores.team1 && (
          <MotionBox
            key={`bg1-${team1AnimKey}`}
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blue.900"
            pointerEvents="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            zIndex={1}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {team2AnimKey > 0 && scores.team2 > prevScores.team2 && (
          <MotionBox
            key={`bg2-${team2AnimKey}`}
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="red.900"
            pointerEvents="none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            zIndex={1}
          />
        )}
      </AnimatePresence>
      {/* Screen Border Flash */}
      <AnimatePresence>
        {team1AnimKey > 0 && scores.team1 > prevScores.team1 && (
          <MotionBox
            key={`border1-${team1AnimKey}`}
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            border="8px solid"
            borderColor="blue.400"
            pointerEvents="none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            zIndex={9999}
            boxShadow="inset 0 0 100px rgba(66, 153, 225, 0.8)"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {team2AnimKey > 0 && scores.team2 > prevScores.team2 && (
          <MotionBox
            key={`border2-${team2AnimKey}`}
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            border="8px solid"
            borderColor="red.400"
            pointerEvents="none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            zIndex={9999}
            boxShadow="inset 0 0 100px rgba(229, 62, 62, 0.8)"
          />
        )}
      </AnimatePresence>

      {/* Connection Status - Top Right */}
      <Box position="fixed" top={4} right={4} zIndex={9999}>
        <Badge
          colorScheme={isConnected ? 'green' : 'red'}
          fontSize="xs"
          px={2}
          py={1}
          borderRadius="md"
        >
          {isConnected ? 'C' : 'D'}
        </Badge>
      </Box>

      <Container maxW="container.xl">
        <Stack gap={12}>
          {/* Header */}
          <Box textAlign="center">
            <Heading
              size="3xl"
              mb={2}
              bgGradient="linear(to-r, cyan.400, purple.500, pink.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              DANCE BATTLE
            </Heading>

            {/* Total Votes */}
            <Box
              display="inline-block"
              bg="gray.800"
              px={6}
              py={3}
              borderRadius="full"
              border="2px solid"
              borderColor="purple.500"
              boxShadow="0 0 20px rgba(168, 85, 247, 0.4)"
            >
              <Text fontSize="lg" color="purple.300" fontWeight="bold">
                Total Votes: <Text as="span" color="white" fontSize="xl">{totalVotes}</Text>
              </Text>
            </Box>
          </Box>

          {/* Team 1 Section */}
          <Box position="relative">
            <Flex align="center" gap={8} mb={4}>
              <MotionBox
                position="relative"
                animate={{
                  scale: team1Scale,
                  rotate: team1Scale > 1 ? [0, -5, 5, 0] : 0
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Expanding Ripple Rings */}
                <AnimatePresence mode="sync">
                  {team1AnimKey > 0 && (
                    <>
                      <MotionBox
                        key={`ring1-${team1AnimKey}`}
                        position="absolute"
                        top="50%"
                        left="50%"
                        w="200px"
                        h="200px"
                        borderRadius="full"
                        border="4px solid"
                        borderColor="blue.300"
                        initial={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ scale: 2.5, opacity: 0, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <MotionBox
                        key={`ring2-${team1AnimKey}`}
                        position="absolute"
                        top="50%"
                        left="50%"
                        w="200px"
                        h="200px"
                        borderRadius="full"
                        border="4px solid"
                        borderColor="cyan.300"
                        initial={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ scale: 2.8, opacity: 0, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                      />
                      <MotionBox
                        key={`ring3-${team1AnimKey}`}
                        position="absolute"
                        top="50%"
                        left="50%"
                        w="200px"
                        h="200px"
                        borderRadius="full"
                        border="3px solid"
                        borderColor="blue.200"
                        initial={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ scale: 3.2, opacity: 0, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Radiating Stars */}
                <AnimatePresence mode="sync">
                  {team1AnimKey > 0 && (
                    <>
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                        const rad = (angle * Math.PI) / 180
                        const distance = 150
                        return (
                          <MotionBox
                            key={`star-${team1AnimKey}-${idx}`}
                            position="absolute"
                            top="50%"
                            left="50%"
                            fontSize="2xl"
                            initial={{
                              x: 0,
                              y: 0,
                              opacity: 1,
                              scale: 0,
                              rotate: 0
                            }}
                            animate={{
                              x: Math.cos(rad) * distance,
                              y: Math.sin(rad) * distance,
                              opacity: 0,
                              scale: 1.5,
                              rotate: 360
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 1,
                              ease: "easeOut",
                              delay: idx * 0.05
                            }}
                          >
                            ✨
                          </MotionBox>
                        )
                      })}
                    </>
                  )}
                </AnimatePresence>

                <Image
                  src={performer1}
                  alt="Team 1"
                  boxSize="200px"
                  borderRadius="full"
                  border="8px solid"
                  borderColor="blue.400"
                  bg="white"
                  objectFit="cover"
                  boxShadow="0 0 40px rgba(66, 153, 225, 0.8)"
                />

                {/* Enhanced Particles */}
                <AnimatePresence>
                  {team1Particles.map(particle => (
                    <MotionBox
                      key={particle.id}
                      position="absolute"
                      top="50%"
                      left="50%"
                      w="16px"
                      h="16px"
                      borderRadius="full"
                      bg={particle.color}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      animate={{
                        opacity: 0,
                        x: particle.x,
                        y: particle.y,
                        scale: 0
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      boxShadow={`0 0 8px ${particle.color}`}
                    />
                  ))}
                </AnimatePresence>
              </MotionBox>

              <Box flex="1">
                <Box mb={2}>
                  <Heading size="xl" color="blue.300">
                    TEAM 1
                  </Heading>
                </Box>

                {/* Progress Bar Container */}
                <MotionBox
                  bg="gray.800"
                  h="120px"
                  borderRadius="full"
                  overflow="hidden"
                  position="relative"
                  border="5px solid"
                  borderColor="blue.500"
                  boxShadow="inset 0 2px 10px rgba(0,0,0,0.5)"
                  animate={{
                    scaleY: team1BarScale
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <MotionBox
                    h="100%"
                    bg="blue.500"
                    borderRadius="full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${team1Percentage}%` }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      type: "spring",
                      stiffness: 100
                    }}
                    position="relative"
                    boxShadow="0 0 30px rgba(66, 153, 225, 0.8)"
                  >
                    <MotionBox
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bgGradient="linear(to-r, transparent, rgba(255,255,255,0.2), transparent)"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </MotionBox>

                  {/* Vote Count Text */}
                  <Text
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    fontSize="5xl"
                    fontWeight="black"
                    color="white"
                    textShadow="2px 2px 8px rgba(0,0,0,0.8)"
                  >
                    {scores.team1} <Text as="span" fontSize="3xl">Votes</Text>
                  </Text>
                </MotionBox>
              </Box>
            </Flex>
          </Box>

          {/* Team 2 Section */}
          <Box position="relative">
            <Flex align="center" gap={8} mb={4}>
              <Box flex="1">
                <Box mb={2}>
                  <Heading size="xl" color="red.300">
                    TEAM 2
                  </Heading>
                </Box>

                {/* Progress Bar Container */}
                <MotionBox
                  bg="gray.800"
                  h="120px"
                  borderRadius="full"
                  overflow="hidden"
                  position="relative"
                  border="5px solid"
                  borderColor="red.500"
                  boxShadow="inset 0 2px 10px rgba(0,0,0,0.5)"
                  animate={{
                    scaleY: team2BarScale
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <MotionBox
                    h="100%"
                    bg="red.500"
                    borderRadius="full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${team2Percentage}%` }}
                    transition={{
                      duration: 0.8,
                      ease: "easeOut",
                      type: "spring",
                      stiffness: 100
                    }}
                    position="relative"
                    boxShadow="0 0 30px rgba(229, 62, 62, 0.8)"
                  >
                    <MotionBox
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bgGradient="linear(to-r, transparent, rgba(255,255,255,0.2), transparent)"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </MotionBox>

                  {/* Vote Count Text */}
                  <Text
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    fontSize="5xl"
                    fontWeight="black"
                    color="white"
                    textShadow="2px 2px 8px rgba(0,0,0,0.8)"
                  >
                    {scores.team2} <Text as="span" fontSize="3xl">Votes</Text>
                  </Text>
                </MotionBox>
              </Box>

              <MotionBox
                position="relative"
                animate={{
                  scale: team2Scale,
                  rotate: team2Scale > 1 ? [0, 5, -5, 0] : 0
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                {/* Expanding Ripple Rings */}
                <AnimatePresence mode="sync">
                  {team2AnimKey > 0 && (
                    <>
                      <MotionBox
                        key={`ring1-${team2AnimKey}`}
                        position="absolute"
                        top="50%"
                        left="50%"
                        w="200px"
                        h="200px"
                        borderRadius="full"
                        border="4px solid"
                        borderColor="red.300"
                        initial={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ scale: 2.5, opacity: 0, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                      <MotionBox
                        key={`ring2-${team2AnimKey}`}
                        position="absolute"
                        top="50%"
                        left="50%"
                        w="200px"
                        h="200px"
                        borderRadius="full"
                        border="4px solid"
                        borderColor="pink.300"
                        initial={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ scale: 2.8, opacity: 0, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                      />
                      <MotionBox
                        key={`ring3-${team2AnimKey}`}
                        position="absolute"
                        top="50%"
                        left="50%"
                        w="200px"
                        h="200px"
                        borderRadius="full"
                        border="3px solid"
                        borderColor="red.200"
                        initial={{ scale: 1, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ scale: 3.2, opacity: 0, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                      />
                    </>
                  )}
                </AnimatePresence>

                {/* Radiating Hearts */}
                <AnimatePresence mode="sync">
                  {team2AnimKey > 0 && (
                    <>
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, idx) => {
                        const rad = (angle * Math.PI) / 180
                        const distance = 150
                        return (
                          <MotionBox
                            key={`heart-${team2AnimKey}-${idx}`}
                            position="absolute"
                            top="50%"
                            left="50%"
                            fontSize="2xl"
                            initial={{
                              x: 0,
                              y: 0,
                              opacity: 1,
                              scale: 0,
                              rotate: 0
                            }}
                            animate={{
                              x: Math.cos(rad) * distance,
                              y: Math.sin(rad) * distance,
                              opacity: 0,
                              scale: 1.5,
                              rotate: 360
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                              duration: 1,
                              ease: "easeOut",
                              delay: idx * 0.05
                            }}
                          >
                            💖
                          </MotionBox>
                        )
                      })}
                    </>
                  )}
                </AnimatePresence>

                <Image
                  src={performer2}
                  alt="Team 2"
                  boxSize="200px"
                  borderRadius="full"
                  border="8px solid"
                  borderColor="red.400"
                  bg="white"
                  objectFit="cover"
                  boxShadow="0 0 40px rgba(229, 62, 62, 0.8)"
                />

                {/* Enhanced Particles */}
                <AnimatePresence>
                  {team2Particles.map(particle => (
                    <MotionBox
                      key={particle.id}
                      position="absolute"
                      top="50%"
                      left="50%"
                      w="16px"
                      h="16px"
                      borderRadius="full"
                      bg={particle.color}
                      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      animate={{
                        opacity: 0,
                        x: particle.x,
                        y: particle.y,
                        scale: 0
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      boxShadow={`0 0 8px ${particle.color}`}
                    />
                  ))}
                </AnimatePresence>
              </MotionBox>
            </Flex>
          </Box>

          {/* Test Buttons - Remove Later */}
          <Box textAlign="center" mt={8}>
            <HStack justify="center" gap={4}>
              <Button
                colorScheme="blue"
                size="sm"
                onClick={() => {
                  setPrevScores(scores)
                  setScores(prev => ({ ...prev, team1: prev.team1 + 1 }))
                }}
              >
                +1 Team 1
              </Button>
              <Button
                colorScheme="red"
                size="sm"
                onClick={() => {
                  setPrevScores(scores)
                  setScores(prev => ({ ...prev, team2: prev.team2 + 1 }))
                }}
              >
                +1 Team 2
              </Button>
            </HStack>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

export default App
