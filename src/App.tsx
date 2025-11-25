import { Box, Text, Image, Flex } from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import performer1 from './assets/performer1.png'
import performer2 from './assets/performer2.png'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
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
  size: number
  velocity: number
  angle: number
}

const MotionBox = motion.create(Box)
const MotionText = motion.create(Text)

function App() {
  const [scores, setScores] = useState<Scores>({ team1: 0, team2: 0 })
  const [prevScores, setPrevScores] = useState<Scores>({ team1: 0, team2: 0 })
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [team1Particles, setTeam1Particles] = useState<Particle[]>([])
  const [team2Particles, setTeam2Particles] = useState<Particle[]>([])
  const [team1AnimKey, setTeam1AnimKey] = useState(0)
  const [team2AnimKey, setTeam2AnimKey] = useState(0)
  const [lastVotedTeam, setLastVotedTeam] = useState<'team1' | 'team2' | null>(null)
  const [team1Scale, setTeam1Scale] = useState(1)
  const [team2Scale, setTeam2Scale] = useState(1)
  const [team1Combo, setTeam1Combo] = useState(0)
  const [team2Combo, setTeam2Combo] = useState(0)
  const particleIdRef = useRef(0)
  const team1LastVoteTime = useRef<number>(0)
  const team2LastVoteTime = useRef<number>(0)

  const fetchScores = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scores`)

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
    fetchScores()
    const interval = setInterval(fetchScores, POLL_INTERVAL)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Trigger animations when scores change
  useEffect(() => {
    if (scores.team1 > prevScores.team1 && scores.team2 === prevScores.team2) {
      const now = Date.now()
      const timeSinceLastVote = now - team1LastVoteTime.current

      setLastVotedTeam('team1')
      setTeam1AnimKey(prev => prev + 1)

      // Build combo for repeated votes
      if (timeSinceLastVote < 2000 && team1LastVoteTime.current > 0) {
        const newCombo = Math.min(team1Combo + 1, 10)
        setTeam1Combo(newCombo)
        setTeam1Scale(1.2 + newCombo * 0.15) // Scale grows with combo
      } else {
        setTeam1Combo(1)
        setTeam1Scale(1.3)
      }

      createParticles('team1', team1Combo)
      team1LastVoteTime.current = now

      setTimeout(() => {
        setTeam1Scale(1)
      }, 800)

      // Reset combo after inactivity
      setTimeout(() => {
        setTeam1Combo(0)
      }, 2500)
    }

    if (scores.team2 > prevScores.team2 && scores.team1 === prevScores.team1) {
      const now = Date.now()
      const timeSinceLastVote = now - team2LastVoteTime.current

      setLastVotedTeam('team2')
      setTeam2AnimKey(prev => prev + 1)

      if (timeSinceLastVote < 2000 && team2LastVoteTime.current > 0) {
        const newCombo = Math.min(team2Combo + 1, 10)
        setTeam2Combo(newCombo)
        setTeam2Scale(1.2 + newCombo * 0.15)
      } else {
        setTeam2Combo(1)
        setTeam2Scale(1.3)
      }

      createParticles('team2', team2Combo)
      team2LastVoteTime.current = now

      setTimeout(() => {
        setTeam2Scale(1)
      }, 800)

      setTimeout(() => {
        setTeam2Combo(0)
      }, 2500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores.team1, scores.team2])

  const createParticles = (team: 'team1' | 'team2', combo: number) => {
    const newParticles: Particle[] = []
    // Using cyan/teal for team 1 and pink/magenta for team 2
    const colors = team === 'team1'
      ? ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#ffffff'] // Cyan shades + white
      : ['#ec4899', '#f472b6', '#f9a8d4', '#fbcfe8', '#ffffff'] // Pink/magenta shades + white

    // More particles with higher combo - bigger explosion
    const particleCount = 30 + combo * 12

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5
      const velocity = 150 + Math.random() * 200 + combo * 30
      newParticles.push({
        id: particleIdRef.current++,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 20 + combo * 3,
        velocity,
        angle
      })
    }

    if (team === 'team1') {
      setTeam1Particles(newParticles)
      setTimeout(() => setTeam1Particles([]), 2000)
    } else {
      setTeam2Particles(newParticles)
      setTimeout(() => setTeam2Particles([]), 2000)
    }
  }

  const totalVotes = scores.team1 + scores.team2
  const team1Percentage = totalVotes === 0 ? 50 : (scores.team1 / totalVotes) * 100

  // Ring sizes based on combo
  const getRingSize = (combo: number) => 250 + combo * 30
  const getRingScale = (combo: number) => 2.5 + combo * 0.3

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(180deg, rgba(88, 28, 135, 0.4) 0%, rgba(15, 23, 42, 1) 40%, rgba(15, 23, 42, 1) 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Decorative glow at top */}
      <Box
        position="absolute"
        top="-15%"
        left="50%"
        transform="translateX(-50%)"
        w="800px"
        h="800px"
        bg="radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)"
        pointerEvents="none"
      />

      {/* Full screen flash for Team 1 - multiple layers for depth */}
      <AnimatePresence>
        {team1AnimKey > 0 && lastVotedTeam === 'team1' && (
          <>
            {/* Main flash */}
            <MotionBox
              key={`flash1-${team1AnimKey}`}
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg={`radial-gradient(circle at 25% 50%, rgba(6, 182, 212, ${0.5 + team1Combo * 0.1}) 0%, transparent 60%)`}
              pointerEvents="none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0.8, 0], scale: [0.8, 1.2, 1.1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 + team1Combo * 0.1, ease: [0.22, 1, 0.36, 1] }}
              zIndex={1}
            />
            {/* Secondary pulse wave */}
            <MotionBox
              key={`flash1b-${team1AnimKey}`}
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg={`radial-gradient(circle at 25% 50%, rgba(34, 211, 238, ${0.3 + team1Combo * 0.05}) 0%, transparent 50%)`}
              pointerEvents="none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 + team1Combo * 0.1, ease: "easeOut", delay: 0.1 }}
              zIndex={1}
            />
          </>
        )}
      </AnimatePresence>

      {/* Full screen flash for Team 2 - multiple layers for depth */}
      <AnimatePresence>
        {team2AnimKey > 0 && lastVotedTeam === 'team2' && (
          <>
            {/* Main flash */}
            <MotionBox
              key={`flash2-${team2AnimKey}`}
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg={`radial-gradient(circle at 75% 50%, rgba(236, 72, 153, ${0.5 + team2Combo * 0.1}) 0%, transparent 60%)`}
              pointerEvents="none"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 1, 0.8, 0], scale: [0.8, 1.2, 1.1, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 + team2Combo * 0.1, ease: [0.22, 1, 0.36, 1] }}
              zIndex={1}
            />
            {/* Secondary pulse wave */}
            <MotionBox
              key={`flash2b-${team2AnimKey}`}
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              bg={`radial-gradient(circle at 75% 50%, rgba(244, 114, 182, ${0.3 + team2Combo * 0.05}) 0%, transparent 50%)`}
              pointerEvents="none"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.5, 2] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 + team2Combo * 0.1, ease: "easeOut", delay: 0.1 }}
              zIndex={1}
            />
          </>
        )}
      </AnimatePresence>

      {/* Border flash Team 1 - with energetic pulse */}
      <AnimatePresence>
        {team1AnimKey > 0 && lastVotedTeam === 'team1' && (
          <>
            <MotionBox
              key={`border1-${team1AnimKey}`}
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              border={`${10 + team1Combo * 3}px solid`}
              borderColor="cyan.400"
              pointerEvents="none"
              initial={{ opacity: 1, scale: 1.02 }}
              animate={{ opacity: [1, 0.8, 0], scale: [1.02, 1, 0.98] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              zIndex={9999}
              boxShadow={`inset 0 0 ${120 + team1Combo * 40}px rgba(6, 182, 212, 0.9)`}
            />
            {/* Inner glow pulse */}
            <MotionBox
              key={`border1-inner-${team1AnimKey}`}
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              pointerEvents="none"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: [0.8, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              zIndex={9998}
              boxShadow={`inset 0 0 ${200 + team1Combo * 60}px rgba(34, 211, 238, 0.5)`}
            />
          </>
        )}
      </AnimatePresence>

      {/* Border flash Team 2 - with energetic pulse */}
      <AnimatePresence>
        {team2AnimKey > 0 && lastVotedTeam === 'team2' && (
          <>
            <MotionBox
              key={`border2-${team2AnimKey}`}
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              border={`${10 + team2Combo * 3}px solid`}
              borderColor="pink.400"
              pointerEvents="none"
              initial={{ opacity: 1, scale: 1.02 }}
              animate={{ opacity: [1, 0.8, 0], scale: [1.02, 1, 0.98] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              zIndex={9999}
              boxShadow={`inset 0 0 ${120 + team2Combo * 40}px rgba(236, 72, 153, 0.9)`}
            />
            {/* Inner glow pulse */}
            <MotionBox
              key={`border2-inner-${team2AnimKey}`}
              position="fixed"
              top="0"
              left="0"
              right="0"
              bottom="0"
              pointerEvents="none"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: [0.8, 0.4, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              zIndex={9998}
              boxShadow={`inset 0 0 ${200 + team2Combo * 60}px rgba(244, 114, 182, 0.5)`}
            />
          </>
        )}
      </AnimatePresence>

      {/* Connection indicator */}
      <Box position="fixed" top={6} right={6} zIndex={9999}>
        <Box
          w={3}
          h={3}
          borderRadius="full"
          bg={isConnected ? 'green.400' : 'red.400'}
          boxShadow={isConnected ? '0 0 10px rgba(72, 187, 120, 0.8)' : '0 0 10px rgba(245, 101, 101, 0.8)'}
        />
      </Box>

      {/* Main Content */}
      <Flex
        direction="column"
        align="center"
        justify="space-between"
        minH="100vh"
        px={8}
        py={8}
        position="relative"
        zIndex={2}
      >
        {/* Header */}
        <Box textAlign="center" mb={4}>
          <Text
            color="purple.300"
            fontSize="sm"
            letterSpacing="widest"
            textTransform="uppercase"
            fontWeight="medium"
            mb={1}
          >
            Live
          </Text>
          <Text
            color="white"
            fontSize="5xl"
            fontWeight="bold"
            letterSpacing="tight"
          >
            Dance Battle
          </Text>
        </Box>

        {/* Battle Arena */}
        <Flex
          align="center"
          justify="center"
          gap={8}
          w="100%"
          flex={1}
        >
          {/* Team 1 */}
          <Flex direction="column" align="center" flex={1}>
            <MotionBox
              position="relative"
              mb={4}
              animate={{
                scale: team1Scale,
                rotate: team1Scale > 1 ? [0, -5 - team1Combo * 2, 5 + team1Combo * 2, -3 - team1Combo, 3 + team1Combo, 0] : 0,
                y: team1Scale > 1 ? [0, -15 - team1Combo * 3, 0] : 0
              }}
              transition={{
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1], // Spring-like bounce
                rotate: { duration: 0.5, ease: "easeOut" }
              }}
            >
              {/* Expanding Ripple Rings - size based on combo */}
              <AnimatePresence mode="sync">
                {team1AnimKey > 0 && (
                  <>
                    {[0, 1, 2, 3, 4, 5].slice(0, 4 + Math.floor(team1Combo / 2)).map((i) => (
                      <MotionBox
                        key={`ring-${team1AnimKey}-${i}`}
                        position="absolute"
                        top="50%"
                        left="50%"
                        w={`${getRingSize(team1Combo)}px`}
                        h={`${getRingSize(team1Combo)}px`}
                        borderRadius="full"
                        border={`${5 + team1Combo * 1.5}px solid`}
                        borderColor={i % 2 === 0 ? "cyan.300" : "teal.200"}
                        initial={{ scale: 0.8, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ scale: getRingScale(team1Combo) + i * 0.3, opacity: 0, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 1.0 + team1Combo * 0.08,
                          ease: [0.22, 1, 0.36, 1], // Smooth deceleration
                          delay: i * 0.08
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Radiating emojis */}
              <AnimatePresence mode="sync">
                {team1AnimKey > 0 && (
                  <>
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].slice(0, 10 + team1Combo).map((angle, idx) => {
                      const rad = (angle * Math.PI) / 180
                      const distance = 220 + team1Combo * 35
                      const wobble = Math.sin(idx * 0.5) * 20
                      return (
                        <MotionBox
                          key={`star-${team1AnimKey}-${idx}`}
                          position="absolute"
                          top="50%"
                          left="50%"
                          fontSize={`${28 + team1Combo * 5}px`}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                          animate={{
                            x: [0, Math.cos(rad) * distance * 0.5 + wobble, Math.cos(rad) * distance],
                            y: [0, Math.sin(rad) * distance * 0.5 + wobble, Math.sin(rad) * distance],
                            opacity: [1, 1, 0],
                            scale: [0, 1.5 + team1Combo * 0.3, 0.8],
                            rotate: [0, 180, 360 + idx * 30]
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 1.0,
                            ease: [0.22, 1, 0.36, 1],
                            delay: idx * 0.02
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
                border="6px solid"
                borderColor="cyan.400"
                bg="white"
                objectFit="cover"
                boxShadow={`0 0 ${40 + team1Combo * 15}px rgba(6, 182, 212, ${0.6 + team1Combo * 0.1})`}
              />

              {/* Particles */}
              <AnimatePresence>
                {team1Particles.map((particle, idx) => (
                  <MotionBox
                    key={particle.id}
                    position="absolute"
                    top="50%"
                    left="50%"
                    w={`${particle.size}px`}
                    h={`${particle.size}px`}
                    borderRadius="full"
                    bg={particle.color}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                    animate={{
                      opacity: [1, 1, 0],
                      x: [0, particle.x * 0.6, particle.x],
                      y: [0, particle.y * 0.6 - 30, particle.y + 20],
                      scale: [0, 1.5, 0.3]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.4,
                      ease: [0.22, 1, 0.36, 1],
                      delay: idx * 0.01
                    }}
                    boxShadow={`0 0 ${particle.size * 1.5}px ${particle.color}`}
                  />
                ))}
              </AnimatePresence>
            </MotionBox>

            {/* Team 1 label */}
            <Text
              color="cyan.300"
              fontSize="sm"
              letterSpacing="widest"
              textTransform="uppercase"
              fontWeight="medium"
              mb={2}
            >
              Team 1
            </Text>

            {/* Team 1 Score */}
            <MotionText
              color="white"
              fontSize="8xl"
              fontWeight="bold"
              lineHeight="1"
              animate={{
                scale: team1Scale > 1 ? [1, 1.3, 0.95, 1.1, 1] : 1,
                y: team1Scale > 1 ? [0, -10, 5, 0] : 0,
                textShadow: team1Scale > 1
                  ? [
                      '0 0 0px rgba(6, 182, 212, 0)',
                      `0 0 ${40 + team1Combo * 10}px rgba(6, 182, 212, 1)`,
                      '0 0 20px rgba(6, 182, 212, 0.5)',
                      '0 0 0px rgba(6, 182, 212, 0)'
                    ]
                  : '0 0 0px rgba(6, 182, 212, 0)'
              }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1]
              }}
            >
              {scores.team1}
            </MotionText>

            {/* Combo indicator */}
            <AnimatePresence>
              {team1Combo > 1 && (
                <MotionText
                  color="cyan.300"
                  fontSize={`${18 + team1Combo * 2}px`}
                  fontWeight="bold"
                  textShadow={`0 0 ${20 + team1Combo * 5}px rgba(6, 182, 212, 0.8)`}
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.1 + team1Combo * 0.05, 1],
                    rotate: [0, -3, 3, 0]
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  {team1Combo}x COMBO!
                </MotionText>
              )}
            </AnimatePresence>
          </Flex>

          {/* Center VS */}
          <Box>
            <Text
              color="whiteAlpha.500"
              fontSize="5xl"
              fontWeight="bold"
              letterSpacing="wider"
            >
              VS
            </Text>
          </Box>

          {/* Team 2 */}
          <Flex direction="column" align="center" flex={1}>
            <MotionBox
              position="relative"
              mb={4}
              animate={{
                scale: team2Scale,
                rotate: team2Scale > 1 ? [0, 5 + team2Combo * 2, -5 - team2Combo * 2, 3 + team2Combo, -3 - team2Combo, 0] : 0,
                y: team2Scale > 1 ? [0, -15 - team2Combo * 3, 0] : 0
              }}
              transition={{
                duration: 0.6,
                ease: [0.34, 1.56, 0.64, 1], // Spring-like bounce
                rotate: { duration: 0.5, ease: "easeOut" }
              }}
            >
              {/* Expanding Ripple Rings */}
              <AnimatePresence mode="sync">
                {team2AnimKey > 0 && (
                  <>
                    {[0, 1, 2, 3, 4, 5].slice(0, 4 + Math.floor(team2Combo / 2)).map((i) => (
                      <MotionBox
                        key={`ring-${team2AnimKey}-${i}`}
                        position="absolute"
                        top="50%"
                        left="50%"
                        w={`${getRingSize(team2Combo)}px`}
                        h={`${getRingSize(team2Combo)}px`}
                        borderRadius="full"
                        border={`${5 + team2Combo * 1.5}px solid`}
                        borderColor={i % 2 === 0 ? "pink.300" : "pink.200"}
                        initial={{ scale: 0.8, opacity: 1, x: '-50%', y: '-50%' }}
                        animate={{ scale: getRingScale(team2Combo) + i * 0.3, opacity: 0, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: 1.0 + team2Combo * 0.08,
                          ease: [0.22, 1, 0.36, 1], // Smooth deceleration
                          delay: i * 0.08
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>

              {/* Radiating emojis */}
              <AnimatePresence mode="sync">
                {team2AnimKey > 0 && (
                  <>
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].slice(0, 10 + team2Combo).map((angle, idx) => {
                      const rad = (angle * Math.PI) / 180
                      const distance = 220 + team2Combo * 35
                      const wobble = Math.sin(idx * 0.5) * 20
                      return (
                        <MotionBox
                          key={`heart-${team2AnimKey}-${idx}`}
                          position="absolute"
                          top="50%"
                          left="50%"
                          fontSize={`${28 + team2Combo * 5}px`}
                          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                          animate={{
                            x: [0, Math.cos(rad) * distance * 0.5 + wobble, Math.cos(rad) * distance],
                            y: [0, Math.sin(rad) * distance * 0.5 + wobble, Math.sin(rad) * distance],
                            opacity: [1, 1, 0],
                            scale: [0, 1.5 + team2Combo * 0.3, 0.8],
                            rotate: [0, 180, 360 + idx * 30]
                          }}
                          exit={{ opacity: 0 }}
                          transition={{
                            duration: 1.0,
                            ease: [0.22, 1, 0.36, 1],
                            delay: idx * 0.02
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
                border="6px solid"
                borderColor="pink.400"
                bg="white"
                objectFit="cover"
                boxShadow={`0 0 ${40 + team2Combo * 15}px rgba(236, 72, 153, ${0.6 + team2Combo * 0.1})`}
              />

              {/* Particles */}
              <AnimatePresence>
                {team2Particles.map((particle, idx) => (
                  <MotionBox
                    key={particle.id}
                    position="absolute"
                    top="50%"
                    left="50%"
                    w={`${particle.size}px`}
                    h={`${particle.size}px`}
                    borderRadius="full"
                    bg={particle.color}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
                    animate={{
                      opacity: [1, 1, 0],
                      x: [0, particle.x * 0.6, particle.x],
                      y: [0, particle.y * 0.6 - 30, particle.y + 20],
                      scale: [0, 1.5, 0.3]
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.4,
                      ease: [0.22, 1, 0.36, 1],
                      delay: idx * 0.01
                    }}
                    boxShadow={`0 0 ${particle.size * 1.5}px ${particle.color}`}
                  />
                ))}
              </AnimatePresence>
            </MotionBox>

            {/* Team 2 label */}
            <Text
              color="pink.300"
              fontSize="sm"
              letterSpacing="widest"
              textTransform="uppercase"
              fontWeight="medium"
              mb={2}
            >
              Team 2
            </Text>

            {/* Team 2 Score */}
            <MotionText
              color="white"
              fontSize="8xl"
              fontWeight="bold"
              lineHeight="1"
              animate={{
                scale: team2Scale > 1 ? [1, 1.3, 0.95, 1.1, 1] : 1,
                y: team2Scale > 1 ? [0, -10, 5, 0] : 0,
                textShadow: team2Scale > 1
                  ? [
                      '0 0 0px rgba(236, 72, 153, 0)',
                      `0 0 ${40 + team2Combo * 10}px rgba(236, 72, 153, 1)`,
                      '0 0 20px rgba(236, 72, 153, 0.5)',
                      '0 0 0px rgba(236, 72, 153, 0)'
                    ]
                  : '0 0 0px rgba(236, 72, 153, 0)'
              }}
              transition={{
                duration: 0.5,
                ease: [0.34, 1.56, 0.64, 1]
              }}
            >
              {scores.team2}
            </MotionText>

            {/* Combo indicator */}
            <AnimatePresence>
              {team2Combo > 1 && (
                <MotionText
                  color="pink.300"
                  fontSize={`${18 + team2Combo * 2}px`}
                  fontWeight="bold"
                  textShadow={`0 0 ${20 + team2Combo * 5}px rgba(236, 72, 153, 0.8)`}
                  initial={{ opacity: 0, y: 20, scale: 0.5 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: [1, 1.1 + team2Combo * 0.05, 1],
                    rotate: [0, 3, -3, 0]
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{
                    duration: 0.4,
                    ease: [0.34, 1.56, 0.64, 1]
                  }}
                >
                  {team2Combo}x COMBO!
                </MotionText>
              )}
            </AnimatePresence>
          </Flex>
        </Flex>

        {/* Bottom: Horizontal Progress Bar */}
        <Box w="100%" maxW="900px" px={4} mb={8}>
          {/* Total votes */}
          <Text
            color="whiteAlpha.500"
            fontSize="sm"
            textAlign="center"
            mb={3}
          >
            {totalVotes} votes cast
          </Text>

          {/* Progress bar container */}
          <Box
            h="60px"
            bg="whiteAlpha.100"
            borderRadius="full"
            overflow="hidden"
            position="relative"
            border="2px solid"
            borderColor="whiteAlpha.200"
          >
            {/* Team 1 bar (cyan, from left) */}
            <MotionBox
              position="absolute"
              top="0"
              left="0"
              bottom="0"
              bg="linear-gradient(90deg, rgba(6, 182, 212, 0.95) 0%, rgba(34, 211, 238, 0.95) 100%)"
              borderRadius="full"
              initial={{ width: "50%" }}
              animate={{
                width: `${team1Percentage}%`,
                boxShadow: lastVotedTeam === 'team1'
                  ? [
                      '0 0 30px rgba(6, 182, 212, 0.6)',
                      `0 0 ${60 + team1Combo * 15}px rgba(6, 182, 212, 1)`,
                      '0 0 30px rgba(6, 182, 212, 0.6)'
                    ]
                  : '0 0 30px rgba(6, 182, 212, 0.6)'
              }}
              transition={{
                width: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                boxShadow: { duration: 0.5 }
              }}
            />

            {/* Team 2 bar (pink, from right) */}
            <MotionBox
              position="absolute"
              top="0"
              right="0"
              bottom="0"
              bg="linear-gradient(90deg, rgba(244, 114, 182, 0.95) 0%, rgba(236, 72, 153, 0.95) 100%)"
              borderRadius="full"
              initial={{ width: "50%" }}
              animate={{
                width: `${100 - team1Percentage}%`,
                boxShadow: lastVotedTeam === 'team2'
                  ? [
                      '0 0 30px rgba(236, 72, 153, 0.6)',
                      `0 0 ${60 + team2Combo * 15}px rgba(236, 72, 153, 1)`,
                      '0 0 30px rgba(236, 72, 153, 0.6)'
                    ]
                  : '0 0 30px rgba(236, 72, 153, 0.6)'
              }}
              transition={{
                width: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
                boxShadow: { duration: 0.5 }
              }}
            />


            {/* Percentage labels */}
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              align="center"
              justify="space-between"
              px={6}
            >
              <Text color="white" fontSize="xl" fontWeight="bold" textShadow="0 2px 4px rgba(0,0,0,0.5)">
                {Math.round(team1Percentage)}%
              </Text>
              <Text color="white" fontSize="xl" fontWeight="bold" textShadow="0 2px 4px rgba(0,0,0,0.5)">
                {Math.round(100 - team1Percentage)}%
              </Text>
            </Flex>
          </Box>
        </Box>

      </Flex>
    </Box>
  )
}

export default App
