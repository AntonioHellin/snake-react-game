import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const BOARD_SIZE = 20

type Difficulty = 'EASY' | 'NORMAL' | 'HARD'

const DIFFICULTY_SETTINGS: Record<Difficulty, { base: number; min: number; decrement: number; label: string }> = {
  EASY: { base: 180, min: 100, decrement: 2, label: 'Easy' },
  NORMAL: { base: 130, min: 70, decrement: 3, label: 'Normal' },
  HARD: { base: 90, min: 40, decrement: 4, label: 'Hard' },
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
type Point = { x: number; y: number }

const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
]

const DIRECTION_VECTORS: Record<Direction, Point> = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}

const DIRECTION_BY_KEY: Record<string, Direction> = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
}

const createFood = (snake: Point[]): Point => {
  let food: Point = { x: 0, y: 0 }
  let isOverlappingSnake = false

  do {
    food = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    }

    isOverlappingSnake = snake.some(
      (segment) => segment.x === food.x && segment.y === food.y,
    )
  } while (isOverlappingSnake)

  return food
}

function App() {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE)
  const [food, setFood] = useState<Point>(() => createFood(INITIAL_SNAKE))
  const [direction, setDirection] = useState<Direction>('RIGHT')
  const [queuedDirection, setQueuedDirection] = useState<Direction>('RIGHT')
  const [score, setScore] = useState(0)
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL')
  const [highScores, setHighScores] = useState<Record<Difficulty, number>>(() => {
    try {
      const saved = localStorage.getItem('snakeHighScores')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && typeof parsed === 'object') {
          return {
            EASY: Number(parsed.EASY) || 0,
            NORMAL: Number(parsed.NORMAL) || 0,
            HARD: Number(parsed.HARD) || 0,
          }
        }
      }
      return { EASY: 0, NORMAL: 0, HARD: 0 }
    } catch {
      return { EASY: 0, NORMAL: 0, HARD: 0 }
    }
  })
  const [isRunning, setIsRunning] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)

  const speed = useMemo(() => {
    const settings = DIFFICULTY_SETTINGS[difficulty]
    return Math.max(settings.min, settings.base - score * settings.decrement)
  }, [score, difficulty])

  useEffect(() => {
    if (score > highScores[difficulty]) {
      const newHighScores = { ...highScores, [difficulty]: score }
      setHighScores(newHighScores)
      try {
        localStorage.setItem('snakeHighScores', JSON.stringify(newHighScores))
      } catch {
        /* storage full or private browsing mode */
      }
    }
  }, [score, difficulty, highScores])

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE)
    setFood(createFood(INITIAL_SNAKE))
    setDirection('RIGHT')
    setQueuedDirection('RIGHT')
    setScore(0)
    setIsRunning(false)
    setIsGameOver(false)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const nextDirection = DIRECTION_BY_KEY[event.key]

      if (nextDirection) {
        event.preventDefault()

        if (OPPOSITE_DIRECTIONS[direction] !== nextDirection) {
          setQueuedDirection(nextDirection)
          if (!isGameOver) {
            setIsRunning(true)
          }
        }
        return
      }

      if (event.key === ' ' && !isGameOver) {
        event.preventDefault()
        setIsRunning((running) => !running)
      }

      if (event.key === 'Enter' && isGameOver) {
        resetGame()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [direction, isGameOver, resetGame])

  useEffect(() => {
    if (!isRunning || isGameOver) {
      return
    }

    const intervalId = window.setInterval(() => {
      const nextDirection =
        OPPOSITE_DIRECTIONS[direction] === queuedDirection
          ? direction
          : queuedDirection

      setDirection(nextDirection)

      setSnake((currentSnake) => {
        const head = currentSnake[0]
        const movement = DIRECTION_VECTORS[nextDirection]
        const newHead = { x: head.x + movement.x, y: head.y + movement.y }
        const collidedWithWall =
          newHead.x < 0 ||
          newHead.x >= BOARD_SIZE ||
          newHead.y < 0 ||
          newHead.y >= BOARD_SIZE
        const didEatFood = newHead.x === food.x && newHead.y === food.y
        const snakeToCheck = didEatFood
          ? currentSnake
          : currentSnake.slice(0, -1)
        const collidedWithSelf = snakeToCheck.some(
          (segment) => segment.x === newHead.x && segment.y === newHead.y,
        )

        if (collidedWithWall || collidedWithSelf) {
          setIsGameOver(true)
          setIsRunning(false)
          return currentSnake
        }

        const nextSnake = didEatFood
          ? [newHead, ...currentSnake]
          : [newHead, ...currentSnake.slice(0, -1)]

        if (didEatFood) {
          setScore((currentScore) => currentScore + 1)
          setFood(createFood(nextSnake))
        }

        return nextSnake
      })
    }, speed)

    return () => window.clearInterval(intervalId)
  }, [direction, food, isGameOver, isRunning, queuedDirection, speed])

  const snakeCells = useMemo(
    () => new Set(snake.map((segment) => `${segment.x}-${segment.y}`)),
    [snake],
  )
  const headPosition = `${snake[0].x}-${snake[0].y}`

  const boardCells = useMemo(
    () =>
      Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
        const x = index % BOARD_SIZE
        const y = Math.floor(index / BOARD_SIZE)
        const position = `${x}-${y}`
        const isFood = x === food.x && y === food.y
        const isSnake = snakeCells.has(position)
        const isHead = position === headPosition

        let className = 'cell'

        if (isFood) {
          className += ' food'
        } else if (isSnake) {
          className += isHead ? ' snake head' : ' snake'
        }

        return <div key={position} className={className}></div>
      }),
    [food.x, food.y, headPosition, snakeCells],
  )

  return (
    <main className="snake-app">
      <header className="hud">
        <h1>Snake</h1>
        <div className="stats">
          <p className="score">
            Score: <strong>{score}</strong>
          </p>
          <p className="high-score">
            High Score: <strong>{highScores[difficulty]}</strong>
          </p>
        </div>
        <div className="controls-group">
          <select
            className="difficulty-select"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value as Difficulty)
              resetGame()
            }}
            disabled={isRunning && !isGameOver}
            aria-label="Select difficulty"
          >
            {(Object.keys(DIFFICULTY_SETTINGS) as Difficulty[]).map((level) => (
              <option key={level} value={level}>
                {DIFFICULTY_SETTINGS[level].label}
              </option>
            ))}
          </select>
          <div className="actions">
            <button
              type="button"
              onClick={() => setIsRunning((running) => !running)}
              disabled={isGameOver}
            >
              {isRunning ? 'Pause' : 'Play'}
            </button>
            <button type="button" className="secondary" onClick={resetGame}>
              Reset
            </button>
          </div>
        </div>
      </header>

      <section className="board" aria-label="Snake game board">
        {boardCells}
      </section>

      <p className="status">
        {isGameOver
          ? 'Game Over. Press Reset or Enter to play again.'
          : isRunning
            ? 'Move with Arrow keys or WASD. Spacebar to pause.'
            : 'Press Play or an arrow key to start.'}
      </p>
    </main>
  )
}

export default App
