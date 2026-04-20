'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import songs from '../../data/songs.json'

// Icons
const PlayIcon = () => (
  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
)

const SpotifyIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
  </svg>
)

const TrophyIcon = () => (
  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z"/>
  </svg>
)

const WINNING_CARDS = 10
const STARTING_TOKENS = 2
const MAX_TOKENS = 5
const INSTANT_CARD_COST = 3

export default function TeamsPage() {
  // Game phases: 'setup' | 'playing' | 'finished'
  const [gamePhase, setGamePhase] = useState('setup')
  
  // Team setup
  const [team1Name, setTeam1Name] = useState('Team 1')
  const [team2Name, setTeam2Name] = useState('Team 2')
  
  // Game state
  const [team1Timeline, setTeam1Timeline] = useState([])
  const [team2Timeline, setTeam2Timeline] = useState([])
  const [team1Tokens, setTeam1Tokens] = useState(STARTING_TOKENS)
  const [team2Tokens, setTeam2Tokens] = useState(STARTING_TOKENS)
  const [currentTeam, setCurrentTeam] = useState(1)
  const [currentSong, setCurrentSong] = useState(null)
  const [usedSongIds, setUsedSongIds] = useState(new Set())
  
  // Round phases: 'listening' | 'placing' | 'stealing' | 'result'
  const [roundPhase, setRoundPhase] = useState('listening')
  const [isPlaying, setIsPlaying] = useState(false)
  
  // Placement tracking
  const [activeTeamPlacement, setActiveTeamPlacement] = useState(null)
  const [stealAttempt, setStealAttempt] = useState(null)
  
  // Results
  const [placementCorrect, setPlacementCorrect] = useState(null)
  const [stealSuccess, setStealSuccess] = useState(null)
  const [resultMessage, setResultMessage] = useState('')
  
  // Bonus phase
  const [showBonusPrompt, setShowBonusPrompt] = useState(false)
  const [bonusAwarded, setBonusAwarded] = useState(false)
  
  // Skip tracking
  const [team1SkipNextTurn, setTeam1SkipNextTurn] = useState(false)
  const [team2SkipNextTurn, setTeam2SkipNextTurn] = useState(false)
  
  // Winner
  const [winner, setWinner] = useState(null)

  // Get random unused song
  const getRandomSong = useCallback(() => {
    const unusedSongs = songs.filter(s => !usedSongIds.has(s.id))
    if (unusedSongs.length === 0) {
      setUsedSongIds(new Set())
      return songs[Math.floor(Math.random() * songs.length)]
    }
    return unusedSongs[Math.floor(Math.random() * unusedSongs.length)]
  }, [usedSongIds])

  // Helpers
  const getCurrentTimeline = () => currentTeam === 1 ? team1Timeline : team2Timeline
  const getCurrentTokens = () => currentTeam === 1 ? team1Tokens : team2Tokens
  const getOpponentTokens = () => currentTeam === 1 ? team2Tokens : team1Tokens
  const getOpponentTeam = () => currentTeam === 1 ? 2 : 1
  const getCurrentTeamName = () => currentTeam === 1 ? team1Name : team2Name
  const getOpponentTeamName = () => currentTeam === 1 ? team2Name : team1Name

  const isPlacementValid = (position, newSongYear, timeline) => {
    const leftSong = position > 0 ? timeline[position - 1] : null
    const rightSong = position < timeline.length ? timeline[position] : null
    const leftYear = leftSong ? leftSong.year : -Infinity
    const rightYear = rightSong ? rightSong.year : Infinity
    return newSongYear >= leftYear && newSongYear <= rightYear
  }

  const addTokens = (team, amount) => {
    if (team === 1) {
      setTeam1Tokens(prev => Math.min(prev + amount, MAX_TOKENS))
    } else {
      setTeam2Tokens(prev => Math.min(prev + amount, MAX_TOKENS))
    }
  }

  const removeTokens = (team, amount) => {
    if (team === 1) {
      setTeam1Tokens(prev => Math.max(prev - amount, 0))
    } else {
      setTeam2Tokens(prev => Math.max(prev - amount, 0))
    }
  }

  const startGame = () => {
    const firstSong1 = songs[Math.floor(Math.random() * songs.length)]
    let firstSong2 = songs[Math.floor(Math.random() * songs.length)]
    while (firstSong2.id === firstSong1.id) {
      firstSong2 = songs[Math.floor(Math.random() * songs.length)]
    }
    
    setTeam1Timeline([firstSong1])
    setTeam2Timeline([firstSong2])
    setTeam1Tokens(STARTING_TOKENS)
    setTeam2Tokens(STARTING_TOKENS)
    setUsedSongIds(new Set([firstSong1.id, firstSong2.id]))
    
    const availableSongs = songs.filter(s => s.id !== firstSong1.id && s.id !== firstSong2.id)
    const firstPlaySong = availableSongs[Math.floor(Math.random() * availableSongs.length)]
    setCurrentSong(firstPlaySong)
    setUsedSongIds(new Set([firstSong1.id, firstSong2.id, firstPlaySong.id]))
    
    setCurrentTeam(1)
    setRoundPhase('listening')
    setGamePhase('playing')
  }

  // DJ opens Spotify
  const openSpotify = () => {
    if (currentSong) {
      window.open(currentSong.spotify_url, '_blank')
    }
  }

  // Mark song as playing
  const markSongPlaying = () => {
    setIsPlaying(true)
    setRoundPhase('placing')
  }

  const placeSongAtPosition = (position) => {
    setActiveTeamPlacement(position)
    setRoundPhase('stealing')
  }

  const callHitster = () => {
    removeTokens(getOpponentTeam(), 1)
    setStealAttempt({ team: getOpponentTeam(), position: null })
  }

  const placeStealPosition = (position) => {
    if (position === activeTeamPlacement) {
      alert("Can't place on the same spot! Choose a different position.")
      return
    }
    setStealAttempt({ ...stealAttempt, position })
  }

  const skipStealing = () => {
    resolveRound()
  }

  const confirmSteal = () => {
    resolveRound()
  }

  const resolveRound = () => {
    const timeline = getCurrentTimeline()
    const activeCorrect = isPlacementValid(activeTeamPlacement, currentSong.year, timeline)
    
    let message = ''
    let cardGoesTo = null
    let stealWasSuccessful = false
    
    setPlacementCorrect(activeCorrect)
    
    if (stealAttempt && stealAttempt.position !== null) {
      const stealCorrect = isPlacementValid(stealAttempt.position, currentSong.year, timeline)
      
      if (!activeCorrect && stealCorrect) {
        stealWasSuccessful = true
        cardGoesTo = stealAttempt.team
        message = `🎯 STOLEN! ${stealAttempt.team === 1 ? team1Name : team2Name} steals the card!`
      } else if (!activeCorrect && !stealCorrect) {
        message = `❌ Both wrong! Card discarded. ${stealAttempt.team === 1 ? team1Name : team2Name} loses their token.`
      } else if (activeCorrect) {
        cardGoesTo = currentTeam
        message = `✅ ${getCurrentTeamName()} was correct! ${getOpponentTeamName()} loses their token.`
      }
    } else {
      if (activeCorrect) {
        cardGoesTo = currentTeam
        message = `✅ Correct! Card added to ${getCurrentTeamName()}'s timeline.`
      } else {
        message = `❌ Wrong! Card discarded.`
      }
    }
    
    setStealSuccess(stealWasSuccessful)
    setResultMessage(message)
    
    if (cardGoesTo) {
      const targetTimeline = cardGoesTo === 1 ? [...team1Timeline] : [...team2Timeline]
      const insertPosition = cardGoesTo === currentTeam ? activeTeamPlacement : stealAttempt.position
      targetTimeline.splice(insertPosition, 0, currentSong)
      
      if (cardGoesTo === 1) {
        setTeam1Timeline(targetTimeline)
        if (targetTimeline.length >= WINNING_CARDS) {
          setWinner(team1Name)
          setGamePhase('finished')
          return
        }
      } else {
        setTeam2Timeline(targetTimeline)
        if (targetTimeline.length >= WINNING_CARDS) {
          setWinner(team2Name)
          setGamePhase('finished')
          return
        }
      }
    }
    
    setShowBonusPrompt(true)
    setRoundPhase('result')
  }

  const awardBonus = (awarded) => {
    if (awarded) {
      addTokens(currentTeam, 1)
      setBonusAwarded(true)
    }
    setShowBonusPrompt(false)
  }

  const skipWithToken = () => {
    if (getCurrentTokens() < 1) return
    removeTokens(currentTeam, 1)
    nextTurn()
  }

  const useInstantCard = () => {
    if (getCurrentTokens() < INSTANT_CARD_COST) return
    
    removeTokens(currentTeam, INSTANT_CARD_COST)
    
    const timeline = [...getCurrentTimeline()]
    let insertPos = timeline.length
    for (let i = 0; i < timeline.length; i++) {
      if (currentSong.year <= timeline[i].year) {
        insertPos = i
        break
      }
    }
    timeline.splice(insertPos, 0, currentSong)
    
    if (currentTeam === 1) {
      setTeam1Timeline(timeline)
      setTeam1SkipNextTurn(true)
      if (timeline.length >= WINNING_CARDS) {
        setWinner(team1Name)
        setGamePhase('finished')
        return
      }
    } else {
      setTeam2Timeline(timeline)
      setTeam2SkipNextTurn(true)
      if (timeline.length >= WINNING_CARDS) {
        setWinner(team2Name)
        setGamePhase('finished')
        return
      }
    }
    
    setResultMessage(`💫 Instant Card! ${getCurrentTeamName()} adds card directly. Skip next turn.`)
    setRoundPhase('result')
    setShowBonusPrompt(false)
  }

  const nextTurn = () => {
    let nextTeam = currentTeam === 1 ? 2 : 1
    
    if (nextTeam === 1 && team1SkipNextTurn) {
      setTeam1SkipNextTurn(false)
      nextTeam = 2
    } else if (nextTeam === 2 && team2SkipNextTurn) {
      setTeam2SkipNextTurn(false)
      nextTeam = 1
    }
    
    setCurrentTeam(nextTeam)
    
    const song = getRandomSong()
    setCurrentSong(song)
    setUsedSongIds(prev => new Set([...prev, song.id]))
    
    setIsPlaying(false)
    setRoundPhase('listening')
    setActiveTeamPlacement(null)
    setStealAttempt(null)
    setPlacementCorrect(null)
    setStealSuccess(null)
    setResultMessage('')
    setShowBonusPrompt(false)
    setBonusAwarded(false)
  }

  const resetGame = () => {
    setGamePhase('setup')
    setTeam1Timeline([])
    setTeam2Timeline([])
    setTeam1Tokens(STARTING_TOKENS)
    setTeam2Tokens(STARTING_TOKENS)
    setCurrentSong(null)
    setUsedSongIds(new Set())
    setIsPlaying(false)
    setRoundPhase('listening')
    setActiveTeamPlacement(null)
    setStealAttempt(null)
    setPlacementCorrect(null)
    setStealSuccess(null)
    setResultMessage('')
    setWinner(null)
    setCurrentTeam(1)
    setShowBonusPrompt(false)
    setBonusAwarded(false)
    setTeam1SkipNextTurn(false)
    setTeam2SkipNextTurn(false)
  }

  const TokenDisplay = ({ count, max, color }) => (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full border-2 ${
            i < count
              ? color === 'blue' ? 'bg-blue-500 border-blue-400' : 'bg-red-500 border-red-400'
              : 'bg-transparent border-gray-600'
          }`}
        />
      ))}
    </div>
  )

  // ============ SETUP SCREEN ============
  if (gamePhase === 'setup') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-bollywood-dark to-black">
        <div className="text-center mb-8">
          <Link href="/" className="text-gray-500 text-sm mb-4 inline-block">← Back to Menu</Link>
          <h1 className="text-4xl font-display font-bold text-gradient-gold mb-2">Team Battle</h1>
          <p className="text-gray-400">First team to {WINNING_CARDS} cards wins!</p>
        </div>

        <div className="w-full max-w-md space-y-4 mb-6">
          <div className="glass-card rounded-xl p-4">
            <label className="block text-sm text-blue-400 mb-2 font-semibold">🔵 Team 1</label>
            <input
              type="text"
              value={team1Name}
              onChange={(e) => setTeam1Name(e.target.value || 'Team 1')}
              placeholder="Enter team name"
              className="w-full px-4 py-3 bg-white/10 border border-blue-500/30 rounded-lg text-white text-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="text-center text-2xl text-gray-600">⚔️</div>
          
          <div className="glass-card rounded-xl p-4">
            <label className="block text-sm text-red-400 mb-2 font-semibold">🔴 Team 2</label>
            <input
              type="text"
              value={team2Name}
              onChange={(e) => setTeam2Name(e.target.value || 'Team 2')}
              placeholder="Enter team name"
              className="w-full px-4 py-3 bg-white/10 border border-red-500/30 rounded-lg text-white text-lg focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* DJ Mode Info */}
        <div className="w-full max-w-md glass-card rounded-xl p-4 mb-6 border border-green-500/30 bg-green-500/5">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎧</div>
            <div>
              <h3 className="font-semibold text-green-400 mb-1">DJ Mode Built-in!</h3>
              <p className="text-xs text-gray-400">
                Designate one person as DJ. They'll tap "Open in Spotify" while players look away. 
                Song plays on speaker, everyone guesses, no one sees the song name!
              </p>
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="w-full max-w-md glass-card rounded-xl p-4 mb-6 text-sm text-gray-400">
          <h3 className="font-semibold text-white mb-3">📋 How to Play:</h3>
          <ul className="space-y-2">
            <li>• Each team starts with <span className="text-bollywood-gold">{STARTING_TOKENS} tokens</span> (max {MAX_TOKENS})</li>
            <li>• 🎧 DJ opens Spotify (players look away!)</li>
            <li>• Listen → Place card in timeline by year</li>
            <li>• <span className="text-yellow-400">HITSTER!</span> - Steal if opponent is wrong (1 token)</li>
            <li>• <span className="text-green-400">Bonus token</span> for naming song + artist</li>
            <li>• First to {WINNING_CARDS} cards wins! 🏆</li>
          </ul>
        </div>

        <button
          onClick={startGame}
          className="w-full max-w-md py-5 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold text-xl btn-glow"
        >
          🎮 Start Game
        </button>
      </div>
    )
  }

  // ============ WINNER SCREEN ============
  if (gamePhase === 'finished') {
    const winnerIsTeam1 = winner === team1Name
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-bollywood-dark to-black text-center">
        <div className={`mb-4 ${winnerIsTeam1 ? 'text-blue-400' : 'text-red-400'}`}>
          <TrophyIcon />
        </div>
        
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          🎉 {winner} Wins! 🎉
        </h1>
        
        <p className="text-gray-400 mb-8">
          Built a timeline of {WINNING_CARDS} songs!
        </p>

        <div className="w-full max-w-md grid grid-cols-2 gap-4 mb-8">
          <div className={`glass-card rounded-xl p-4 text-center ${winnerIsTeam1 ? 'border border-blue-500' : ''}`}>
            <div className="text-blue-400 font-semibold mb-1">🔵 {team1Name}</div>
            <div className="text-3xl font-bold text-white">{team1Timeline.length}</div>
            <div className="text-xs text-gray-500">cards</div>
          </div>
          <div className={`glass-card rounded-xl p-4 text-center ${!winnerIsTeam1 ? 'border border-red-500' : ''}`}>
            <div className="text-red-400 font-semibold mb-1">🔴 {team2Name}</div>
            <div className="text-3xl font-bold text-white">{team2Timeline.length}</div>
            <div className="text-xs text-gray-500">cards</div>
          </div>
        </div>

        <div className="w-full max-w-md space-y-3">
          <button
            onClick={resetGame}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold text-lg"
          >
            🔄 Play Again
          </button>
          <Link href="/" className="block w-full py-4 rounded-xl bg-white/10 text-gray-300 font-semibold text-center">
            ← Back to Menu
          </Link>
        </div>
      </div>
    )
  }

  // ============ GAME SCREEN ============
  const timeline = getCurrentTimeline()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-bollywood-dark to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bollywood-dark/90 backdrop-blur border-b border-white/10">
        <div className="flex justify-between items-stretch">
          <div className={`flex-1 p-3 ${currentTeam === 1 ? 'bg-blue-500/20' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-blue-400 font-semibold">🔵 {team1Name}</span>
              <span className="text-lg font-bold text-white">{team1Timeline.length}<span className="text-xs text-gray-500">/{WINNING_CARDS}</span></span>
            </div>
            <TokenDisplay count={team1Tokens} max={MAX_TOKENS} color="blue" />
          </div>
          
          <div className="flex items-center px-2 text-gray-600">⚔️</div>
          
          <div className={`flex-1 p-3 ${currentTeam === 2 ? 'bg-red-500/20' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-red-400 font-semibold">🔴 {team2Name}</span>
              <span className="text-lg font-bold text-white">{team2Timeline.length}<span className="text-xs text-gray-500">/{WINNING_CARDS}</span></span>
            </div>
            <TokenDisplay count={team2Tokens} max={MAX_TOKENS} color="red" />
          </div>
        </div>
        
        <div className={`text-center py-2 font-bold text-white ${currentTeam === 1 ? 'bg-blue-500' : 'bg-red-500'}`}>
          {currentTeam === 1 ? '🔵' : '🔴'} {getCurrentTeamName()}'s Turn
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full overflow-y-auto">
        {currentSong && (
          <>
            {/* Song Card - HIDDEN INFO */}
            <div className={`glass-card rounded-2xl p-5 mb-4 border-2 ${
              roundPhase === 'result'
                ? placementCorrect ? 'border-green-500' : stealSuccess ? 'border-yellow-500' : 'border-red-500'
                : currentTeam === 1 ? 'border-blue-500/30' : 'border-red-500/30'
            }`}>
              <div className="text-center">
                {/* ONLY show song info AFTER result */}
                {roundPhase === 'result' ? (
                  <div className="mb-4 animate-fade-in">
                    <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-gray-400 mb-3">
                      {currentSong.pack} • {currentSong.mood}
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{currentSong.song_name}</h2>
                    <p className="text-gray-400 text-sm">{currentSong.artist}</p>
                    <p className="text-bollywood-gold text-sm">{currentSong.movie}</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <div className="text-6xl mb-3">🎵</div>
                    {!isPlaying ? (
                      <p className="text-gray-400">DJ: Open Spotify, then everyone guesses!</p>
                    ) : (
                      <p className="text-green-400 animate-pulse">🔊 Song is playing... Listen and guess!</p>
                    )}
                  </div>
                )}

                {/* Year Display */}
                <div className="mb-4">
                  {roundPhase === 'result' ? (
                    <div className="text-6xl font-display font-bold text-bollywood-gold animate-pulse">
                      {currentSong.year}
                    </div>
                  ) : (
                    <div className="text-6xl font-display font-bold text-gray-600">????</div>
                  )}
                </div>

                {/* DJ Controls - Only in listening phase */}
                {roundPhase === 'listening' && !isPlaying && (
                  <div className="space-y-3">
                    {/* DJ Warning */}
                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm">
                      🙈 <strong>Players look away!</strong> DJ tap below to open song
                    </div>
                    
                    {/* Open Spotify Button */}
                    <button
                      onClick={openSpotify}
                      className="w-full py-4 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-lg flex items-center justify-center gap-3 transition-all"
                    >
                      <SpotifyIcon />
                      🎧 DJ: Open in Spotify
                    </button>
                    
                    {/* Song Playing Confirmation */}
                    <button
                      onClick={markSongPlaying}
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-bollywood-gold to-bollywood-accent text-black font-bold text-lg btn-glow"
                    >
                      ✅ Song is Playing - Continue
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Result Message */}
            {roundPhase === 'result' && resultMessage && (
              <div className={`rounded-xl p-4 mb-4 text-center ${
                placementCorrect || stealSuccess ? 'bg-green-500/20 border border-green-500' : 'bg-red-500/20 border border-red-500'
              }`}>
                <div className="font-bold text-lg">{resultMessage}</div>
                {bonusAwarded && (
                  <div className="text-yellow-400 text-sm mt-2">🎁 +1 Token for naming song & artist!</div>
                )}
              </div>
            )}

            {/* Bonus Prompt */}
            {showBonusPrompt && roundPhase === 'result' && (
              <div className="glass-card rounded-xl p-4 mb-4 text-center">
                <p className="text-gray-300 mb-3">
                  Did {getCurrentTeamName()} correctly name the <span className="text-white font-semibold">song title</span> AND <span className="text-white font-semibold">artist</span>?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => awardBonus(false)} className="py-3 rounded-lg bg-white/10 text-gray-300 font-medium">
                    ❌ No
                  </button>
                  <button onClick={() => awardBonus(true)} className="py-3 rounded-lg bg-yellow-500/20 border border-yellow-500 text-yellow-400 font-bold">
                    ✅ Yes (+1 Token)
                  </button>
                </div>
              </div>
            )}

            {/* PLACING PHASE */}
            {roundPhase === 'placing' && (
              <div className="mb-4">
                <h3 className="text-sm text-gray-400 mb-2 text-center">
                  👆 {getCurrentTeamName()}, place in your timeline:
                </h3>
                
                <div className="glass-card rounded-xl p-3 overflow-x-auto">
                  <div className="flex items-center gap-2 min-w-max">
                    <button
                      onClick={() => placeSongAtPosition(0)}
                      className={`flex-shrink-0 w-14 h-16 rounded-lg border-2 border-dashed flex items-center justify-center hover:bg-white/10 ${
                        currentTeam === 1 ? 'border-blue-500/50 text-blue-400' : 'border-red-500/50 text-red-400'
                      }`}
                    >
                      ⬅️
                    </button>

                    {timeline.map((song, index) => (
                      <div key={song.id} className="flex items-center gap-2">
                        <div className={`flex-shrink-0 w-20 p-2 rounded-lg text-center border ${
                          currentTeam === 1 ? 'border-blue-500/40 bg-blue-500/10' : 'border-red-500/40 bg-red-500/10'
                        }`}>
                          <div className="text-xl font-bold text-bollywood-gold">{song.year}</div>
                          <div className="text-[9px] text-gray-400 truncate">{song.song_name}</div>
                        </div>

                        <button
                          onClick={() => placeSongAtPosition(index + 1)}
                          className={`flex-shrink-0 w-14 h-16 rounded-lg border-2 border-dashed flex items-center justify-center hover:bg-white/10 ${
                            currentTeam === 1 ? 'border-blue-500/50 text-blue-400' : 'border-red-500/50 text-red-400'
                          }`}
                        >
                          {index === timeline.length - 1 ? '➡️' : '↕️'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={skipWithToken}
                    disabled={getCurrentTokens() < 1}
                    className={`py-3 rounded-lg text-sm font-medium ${
                      getCurrentTokens() >= 1 ? 'bg-white/10 text-gray-300' : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    ⏭️ Skip (1 token)
                  </button>
                  <button
                    onClick={useInstantCard}
                    disabled={getCurrentTokens() < INSTANT_CARD_COST}
                    className={`py-3 rounded-lg text-sm font-medium ${
                      getCurrentTokens() >= INSTANT_CARD_COST
                        ? 'bg-purple-500/20 border border-purple-500 text-purple-400'
                        : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    💫 Instant (3 tokens)
                  </button>
                </div>
              </div>
            )}

            {/* STEALING PHASE */}
            {roundPhase === 'stealing' && (
              <div className="mb-4">
                <div className={`rounded-xl p-3 mb-4 text-center ${currentTeam === 1 ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                  <p className="text-sm text-gray-400">
                    {getCurrentTeamName()} placed at position <span className="font-bold text-white">{activeTeamPlacement + 1}</span>
                  </p>
                </div>

                {!stealAttempt && (
                  <div className="glass-card rounded-xl p-4 mb-4 text-center">
                    <p className="text-gray-300 mb-3">{getOpponentTeamName()}, think they're wrong?</p>
                    <button
                      onClick={callHitster}
                      disabled={getOpponentTokens() < 1}
                      className={`w-full py-4 rounded-xl font-bold text-xl ${
                        getOpponentTokens() >= 1
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black animate-pulse'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      🚨 HITSTER! (1 token)
                    </button>
                  </div>
                )}

                {stealAttempt && stealAttempt.position === null && (
                  <div className="mb-4">
                    <h3 className="text-sm text-yellow-400 mb-2 text-center font-bold">
                      🚨 {getOpponentTeamName()}, where does it go?
                    </h3>
                    
                    <div className="glass-card rounded-xl p-3 overflow-x-auto border border-yellow-500/50">
                      <div className="flex items-center gap-2 min-w-max">
                        <button
                          onClick={() => placeStealPosition(0)}
                          disabled={activeTeamPlacement === 0}
                          className={`flex-shrink-0 w-14 h-16 rounded-lg border-2 border-dashed flex items-center justify-center ${
                            activeTeamPlacement === 0 ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/20'
                          }`}
                        >
                          ⬅️
                        </button>

                        {timeline.map((song, index) => (
                          <div key={song.id} className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-20 p-2 rounded-lg text-center border border-gray-600 bg-gray-800/50">
                              <div className="text-xl font-bold text-bollywood-gold">{song.year}</div>
                            </div>
                            <button
                              onClick={() => placeStealPosition(index + 1)}
                              disabled={activeTeamPlacement === index + 1}
                              className={`flex-shrink-0 w-14 h-16 rounded-lg border-2 border-dashed flex items-center justify-center ${
                                activeTeamPlacement === index + 1 ? 'border-gray-600 text-gray-600 cursor-not-allowed' : 'border-yellow-500 text-yellow-400 hover:bg-yellow-500/20'
                              }`}
                            >
                              {index === timeline.length - 1 ? '➡️' : '↕️'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {stealAttempt && stealAttempt.position !== null && (
                  <div className="glass-card rounded-xl p-4 mb-4 text-center border border-yellow-500">
                    <p className="text-yellow-400 mb-3">
                      {getOpponentTeamName()} placed steal at position <span className="font-bold">{stealAttempt.position + 1}</span>
                    </p>
                    <button onClick={confirmSteal} className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold text-lg">
                      🔮 Reveal Year!
                    </button>
                  </div>
                )}

                {!stealAttempt && (
                  <button onClick={skipStealing} className="w-full py-4 rounded-xl bg-white/10 text-gray-300 font-medium">
                    No Steal → Reveal Year
                  </button>
                )}
              </div>
            )}

            {/* Next Turn */}
            {roundPhase === 'result' && !showBonusPrompt && (
              <button
                onClick={nextTurn}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white ${
                  currentTeam === 1 ? 'bg-red-500' : 'bg-blue-500'
                }`}
              >
                Pass to {currentTeam === 1 ? `🔴 ${team2Name}` : `🔵 ${team1Name}`} →
              </button>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 p-3 bg-bollywood-dark/80">
        <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-blue-400 mb-1">🔵 {team1Name}</div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 transition-all" style={{ width: `${(team1Timeline.length / WINNING_CARDS) * 100}%` }} />
            </div>
          </div>
          <div>
            <div className="text-xs text-red-400 mb-1">🔴 {team2Name}</div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 transition-all" style={{ width: `${(team2Timeline.length / WINNING_CARDS) * 100}%` }} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}