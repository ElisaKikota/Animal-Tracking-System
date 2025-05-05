import React, { useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  IconButton, 
  ButtonGroup,
  Tooltip
} from '@mui/material';
import { Play, Pause, FastForward, Rewind, Clock } from 'lucide-react';

const TimelineControl = ({ 
  paths, 
  currentTime, 
  onTimeChange, 
  isPlaying, 
  onPlayToggle, 
  playbackSpeed,
  onSpeedChange
}) => {
  const playInterval = useRef(null);
  
  // Find the full range of timestamps across all paths
  const allTimestamps = paths.flatMap(animal => 
    animal.locations.map(loc => loc.timestamp)
  );
  
  const minTime = allTimestamps.length > 0 ? Math.min(...allTimestamps) : 0;
  const maxTime = allTimestamps.length > 0 ? Math.max(...allTimestamps) : 0;
  
  // Format the date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'No data';
    return new Date(timestamp).toLocaleString();
  };

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      playInterval.current = setInterval(() => {
        onTimeChange(prevTime => {
          const nextTime = prevTime + (60000 * playbackSpeed); // Advance by minutes × speed
          if (nextTime > maxTime) {
            // Loop back to beginning when we reach the end
            return minTime;
          }
          return nextTime;
        });
      }, 1000); // Update every second
    } else if (playInterval.current) {
      clearInterval(playInterval.current);
    }
    
    return () => {
      if (playInterval.current) {
        clearInterval(playInterval.current);
      }
    };
  }, [isPlaying, playbackSpeed, maxTime, minTime, onTimeChange]);

  const handleSliderChange = (event, newValue) => {
    onTimeChange(newValue);
  };

  const handleSpeedButtonClick = (speed) => {
    onSpeedChange(speed);
  };

  return (
    <Box className="timeline-control">
      <Typography variant="h6" className="section-title">
        <Clock size={20} />
        Timeline Control
      </Typography>
      
      <Box className="current-time">
        <Typography variant="body1">
          Current Time: {formatDate(currentTime)}
        </Typography>
      </Box>
      
      <Box className="timeline-slider">
        <Slider
          value={currentTime || minTime}
          min={minTime}
          max={maxTime}
          onChange={handleSliderChange}
          valueLabelDisplay="auto"
          valueLabelFormat={formatDate}
        />
      </Box>
      
      <Box className="playback-controls">
        <IconButton 
          onClick={() => onTimeChange(minTime)}
          disabled={currentTime === minTime}
        >
          <Rewind />
        </IconButton>
        
        <IconButton onClick={onPlayToggle}>
          {isPlaying ? <Pause /> : <Play />}
        </IconButton>
        
        <IconButton 
          onClick={() => onTimeChange(maxTime)}
          disabled={currentTime === maxTime}
        >
          <FastForward />
        </IconButton>
      </Box>
      
      <Box className="speed-controls">
        <Typography variant="body2">Playback Speed:</Typography>
        <ButtonGroup variant="outlined" size="small">
          <Tooltip title="Slow (1x)">
            <IconButton 
              color={playbackSpeed === 1 ? "primary" : "default"}
              onClick={() => handleSpeedButtonClick(1)}
            >
              1x
            </IconButton>
          </Tooltip>
          <Tooltip title="Normal (5x)">
            <IconButton 
              color={playbackSpeed === 5 ? "primary" : "default"}
              onClick={() => handleSpeedButtonClick(5)}
            >
              5x
            </IconButton>
          </Tooltip>
          <Tooltip title="Fast (15x)">
            <IconButton 
              color={playbackSpeed === 15 ? "primary" : "default"}
              onClick={() => handleSpeedButtonClick(15)}
            >
              15x
            </IconButton>
          </Tooltip>
          <Tooltip title="Very Fast (60x)">
            <IconButton 
              color={playbackSpeed === 60 ? "primary" : "default"}
              onClick={() => handleSpeedButtonClick(60)}
            >
              60x
            </IconButton>
          </Tooltip>
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default TimelineControl;