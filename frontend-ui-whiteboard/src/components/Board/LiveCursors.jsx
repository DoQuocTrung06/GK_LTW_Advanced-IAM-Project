import { Layer, Path } from 'react-konva';
import { Html } from 'react-konva-utils';
import { getUserColor } from './utils/userColors';

const LiveCursors = ({ cursors }) => {
  return (
    <Layer name="cursors-layer" listening={false} hitGraphEnabled={false}>
      {cursors && Object.entries(cursors).map(([userId, cursor]) => {
        const userColor = getUserColor(userId);

        return (
          <Html key={userId} groupProps={{ x: cursor.x, y: cursor.y }} divProps={{ style: { pointerEvents: 'none' } }}>
            
            <svg
              width="20" height="24"
              style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
            >
              <path
                d="M 0 0 L 0 16 L 4.5 12.5 L 8.5 20 L 10.5 19 L 6.5 11.5 L 12 11.5 Z"
                fill={userColor}
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>

           
            <div style={{
              position: 'absolute',
              top: 18,
              left: 14,
              backgroundColor: userColor,
              color: '#ffffff',
              fontSize: '12px',
              fontFamily: 'Arial, sans-serif',
              padding: '2px 6px',
              borderRadius: '4px',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              userSelect: 'none',
            }}>
              {cursor.name}
            </div>
          </Html>
        );
      })}
    </Layer>
  );
};

export default LiveCursors;