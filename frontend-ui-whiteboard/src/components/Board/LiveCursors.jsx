import { Layer, Group, Path, Rect, Text } from 'react-konva';
import { getUserColor } from './utils/userColors';

const LiveCursors = ({ cursors }) => {
  return (
    <Layer name="cursors-layer">
      {cursors && Object.entries(cursors).map(([userId, cursor]) => {
        
        const userColor = getUserColor(userId);

        return (
          <Group key={userId} x={cursor.x} y={cursor.y}>
            <Path
              data="M 0 0 L 0 16 L 4.5 12.5 L 8.5 20 L 10.5 19 L 6.5 11.5 L 12 11.5 Z"
              fill={userColor}
              stroke="#ffffff"
              strokeWidth={1.5}
              shadowColor="rgba(0,0,0,0.2)"
              shadowBlur={2}
              shadowOffsetX={1}
              shadowOffsetY={1}
            />
            <Rect 
              x={15} y={15} 
              width={cursor.name.length * 8 + 10} 
              height={22} 
              fill={userColor} 
              cornerRadius={4} 
            />
            <Text 
              x={20} y={20} 
              text={cursor.name} 
              fill="#ffffff" 
              fontSize={12} 
              fontFamily="Arial"
            />
          </Group>
        );
      })}
    </Layer>
  );
};

export default LiveCursors;