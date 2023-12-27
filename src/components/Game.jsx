import { useMemo, useState, useEffect, useRef } from 'react';
import axios from 'axios'
import './Game.css'

const connections = {
    '0-0': ['0-1', '0-7'],
    '0-1': ['0-0', '0-2', '1-1'],
    '0-2': ['0-1', '0-3'],
    '0-3': ['0-2', '0-4', '1-3'],
    '0-4': ['0-3', '0-5'],
    '0-5': ['0-4', '0-6', '1-5'],
    '0-6': ['0-5', '0-7'],
    '0-7': ['0-6', '0-0', '1-7'],

    '1-0': ['1-1', '1-7'],
    '1-1': ['1-2', '1-0', '0-1', '2-1'],
    '1-2': ['1-3', '1-1'],
    '1-3': ['1-4', '1-2', '0-3', '2-3'],
    '1-4': ['1-5', '1-3'],
    '1-5': ['1-6', '1-4', '0-5', '2-5'],
    '1-6': ['1-7', '1-5'],
    '1-7': ['1-0', '1-6', '0-7', '2-7'],

    '2-0': ['2-1', '2-7'],
    '2-1': ['2-2', '2-0', '1-1'],
    '2-2': ['2-3', '2-1'],
    '2-3': ['2-4', '2-2', '1-3'],
    '2-4': ['2-5', '2-3'],
    '2-5': ['2-6', '2-4', '1-5'],
    '2-6': ['2-7', '2-5'],
    '2-7': ['2-0', '2-6', '1-7'],
}

function areConnected(square1, index1, square2, index2) {
    const key1 = `${square1}-${index1}`;
    const key2 = `${square2}-${index2}`;

    return connections[key1]?.includes(key2);
}

function BoardSquare({ padding, onCircleClick }) {
    const startPadding = padding;
    const endPadding = 100 - startPadding;
    const square = padding / 10 - 1;
    return (
        <>
            <line className='board-line' x1={startPadding} y1={startPadding} x2={endPadding} y2={startPadding} />
            <line className='board-line' x1={endPadding} y1={startPadding} x2={endPadding} y2={endPadding} />
            <line className='board-line' x1={endPadding} y1={endPadding} x2={startPadding} y2={endPadding} />
            <line className='board-line' x1={startPadding} y1={endPadding} x2={startPadding} y2={startPadding} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 0)} cx={startPadding} cy={startPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 1)} cx={50} cy={startPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 2)}  cx={endPadding} cy={startPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 3)}  cx={endPadding} cy={50} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 4)}  cx={endPadding} cy={endPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 5)}  cx={50} cy={endPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 6)}  cx={startPadding} cy={endPadding} r={1} />
            <circle className='board-circle' onClick={() => onCircleClick(square, 7)}  cx={startPadding} cy={50} r={1} />
        </>
    )
}

function Stone({ square, index, color, selected, onStoneClick }) {
    let x = 0;
    let y = 0;
    if (index >= 0 && index < 3) {
        y = square * 10 + 10;
        if (index === 0) {
            x = square * 10 + 10;
        } else if (index === 1) {
            x = 50;
        } else if (index === 2) {
            x = 100 - (square * 10 + 10)
        }
    } else if (index >= 4 && index < 7) {
        y = 100 - (square * 10 + 10);
        if (index === 4) {
            x = 100 - (square * 10 + 10)
        } else if (index === 5) {
            x = 50;
        } else if (index === 6) {
            x = square * 10 + 10;
        }
    } else if (index === 3) {
        y = 50;
        x = 100 - (square * 10 + 10)
    } else if (index === 7) {
        y = 50;
        x = square * 10 + 10;
    }
    return (
        <circle cx={x} cy={y} r={3} fill={color} stroke={selected && 'green' || 'transparent'} strokeWidth={0.5} onClick={() => onStoneClick(square, index, color)} />
    )
}

export default function Game() {
    const [stones, setStones] = useState([])

    const [whiteRemaining, setWhiteRemaining] = useState(9)
    const [blackRemaining, setBlackRemaining] = useState(9)

    const whiteStonesCount = stones.filter(s => s.color === 'white').length
    const blackStonesCount = stones.filter(s => s.color === 'black').length

    const [jumpMode, setJumpMode] = useState(false);

    const [color, setColor] = useState('white')
    function toggleColor() {
        setColor(c => c === 'white' ? 'black' : 'white')
    }

    const [selectedStone, setSelectedStone] = useState(null);

    const [removeStoneMode, setRemoveStoneMode] = useState(false);

    function checkLine(square, index) {
        if (index % 2 !== 0) {
            // centranli
            const prev = stones.find(s => s.square === square && s.index === index - 1);
            const next = stones.find(s => s.square === square && s.index === index + 1);
            console.log('prev', prev)
            console.log('next', next)
            if (prev && next && prev.color === color && next.color === color) {
                return true;
            }

            let newLine = true;
            for (let i = 0; i < 3; i++) {
                const st = stones.find(s => s.square === i && s.index === index);
                if (!st || st.color !== color) {
                    newLine = false;
                    break;
                }
            }
            if (newLine) {
                return true;
            }
        } else {
            const prevIndex = index - 1 >= 0 ? index - 1 : 7;
            const prevPrevIndex = index - 2 >= 0 ? index - 2 : 6;
            const nextIndex = index + 1;
            const nextNextIndex = (index + 2) % 8;

            const prev = stones.find(s => s.square === square && s.index === prevIndex);
            const prevPrev = stones.find(s => s.square === square && s.index === prevPrevIndex);

            // TODO: check what happens if two lines are created

            if (prev && prevPrev && prev.color === color && prevPrev.color === color) {
                return true;
            }

            const next = stones.find(s => s.square === square && s.index === nextIndex);
            const nextNext = stones.find(s => s.square === square && s.index === nextNextIndex);
            
            if (next && nextNext && next.color === color && nextNext.color === color) {
                return true;
            }
        }

        return false;
    }

    const [clicked, setClicked] = useState(false);
    const [clickedSquare, setClickedSquare] = useState(null)
    const [clickedIndex, setClickedIndex] = useState(null)

    useEffect(() => {
        if (clicked && checkLine(clickedSquare, clickedIndex)) {
            setRemoveStoneMode(true);
            setClicked(false);
        } else if (clicked) {
            toggleColor();
        }
    }, [stones, clicked]);

    function onCircleClick(square, index) {
        console.log('circle clicked', square, index);
        if (removeStoneMode) return;

        setClickedSquare(square);
        setClickedIndex(index);

        let clicked = false;
        if (color === 'white' && whiteRemaining > 0 || color === 'black' && blackRemaining > 0) {
            // putting new stones
            setStones(s => [...s, { square, index, color }])
            if (color === 'white') {
                setWhiteRemaining(whiteRemaining - 1);
            } else if (color === 'black') {
                setBlackRemaining(blackRemaining - 1);
            }
            clicked = true;
        } else {
            // moving stones
            if (selectedStone && (jumpMode || areConnected(selectedStone.square, selectedStone.index, square, index))) {
                setJumpMode(false);
                setStones(stones.map(stone =>
                    stone.square === selectedStone.square && stone.index === selectedStone.index && stone.color === selectedStone.color
                    ? { square, index, color: selectedStone.color }
                    : stone
                ));
                clicked = true;
            }
        }

        setClicked(clicked);

        // if (clicked && checkLine(square, index)) {
        //     setRemoveStoneMode(true);
        //     return;
        // }

        // if (clicked) {
        //     toggleColor()
        // }

        // check for points
    }

    function onStoneClick(square, index, stoneColor) {
        console.log('stone clicked', square, index, stoneColor)
        if (removeStoneMode) {
            if (color === stoneColor) return;

            setStones(stones.filter(s => !(s.square === square && s.index === index)));

            setRemoveStoneMode(false);

            // 4 because of setStones taking effect only after next render
            if (
                whiteRemaining === 0 && blackRemaining === 0 &&
                (color === 'white' && blackStonesCount === 4 ||
                color === 'black' && whiteStonesCount === 4)
            ) {
                setJumpMode(true);
            }

            if (
                color === 'white' && blackStonesCount === 3 ||
                color === 'black' && whiteStonesCount === 3
            ) {
                // Game Over!
            }

            toggleColor();
            return;
        }

        if (color !== stoneColor) return;
        if (stoneColor === 'white' && whiteRemaining > 0 || stoneColor === 'black' && blackRemaining > 0) return;
        if (selectedStone && selectedStone.square === square && selectedStone.index === index && selectedStone.color === stoneColor) {
            setSelectedStone(null);
        } else {
            const newStone = stones.find(s => s.square === square && s.index === index && s.color === stoneColor);
            setSelectedStone(newStone);
        }
    }

    function generateConnectedLines() {
        const lines = [];

        for (let square = 0; square < 3; square++) {
            indexLoop: for (let startIndex = 0; startIndex < 4; startIndex++) {
                const start = startIndex * 2;
                const end = start + 2;
                const colors = [];
                for (let index = start; index <= end; index++) {
                    const stone = stones.find(s => s.square === square && s.index === index % 8);
                    if (!stone) continue indexLoop;
                    colors.push(stone.color);
                }
                if (colors.length !== 3) continue; // mozda ne treba
                let lineColor;
                if (colors.every(c => c === 'white')) {
                    lineColor = 'yellow';
                } else if (colors.every(c => c === 'black')) {
                    lineColor = 'green';
                } else {
                    continue;
                }

                if (startIndex === 0 || startIndex === 2) {
                    lines.push(<line
                        key={`${square}-${startIndex}`}
                        style={{ stroke: lineColor, strokeWidth: 0.7 }}
                        data-start-index={startIndex}
                        x1={square * 10 + 10}
                        y1={startIndex === 2 ? 90 - square * 10 : 10 + square * 10}
                        x2={90 - square * 10}
                        y2={startIndex === 2 ? 90 - square * 10 : 10 + square * 10}
                    />);
                } else {
                    lines.push(<line
                        key={`${square}-${startIndex}`}
                        style={{ stroke: lineColor, strokeWidth: 0.7 }}
                        data-start-index={startIndex}
                        x1={startIndex === 1 ? 90 - square * 10 : 10 + square * 10}
                        y1={square * 10 + 10}
                        x2={startIndex === 1 ? 90 - square * 10 : 10 + square * 10}
                        y2={90 - square * 10}
                    />);
                }
            }
        }

        outerLoop: for (let index = 1; index < 8; index += 2) {
            const colors = [];
            for (let square = 0; square < 3; square++) {
                const stone = stones.find(s => s.square === square && s.index === index);
                if (!stone) continue outerLoop;
                colors.push(stone.color);
            }

            if (colors.length !== 3) continue;
            let lineColor;
            if (colors.every(c => c === 'white')) {
                lineColor = 'yellow';
            } else if (colors.every(c => c === 'black')) {
                lineColor = 'green';
            } else {
                continue;
            }

            switch (index) {
            case 1:
                lines.push(<line key={`crossed-${index}`} style={{ stroke: lineColor, strokeWidth: 0.7 }} x1={50} y1={10} x2={50} y2={30} />)
                break;
            case 3:
                lines.push(<line key={`crossed-${index}`} style={{ stroke: lineColor, strokeWidth: 0.7 }} x1={70} y1={50} x2={90} y2={50} />)
                break;
            case 5:
                lines.push(<line key={`crossed-${index}`} style={{ stroke: lineColor, strokeWidth: 0.7 }} x1={50} y1={70} x2={50} y2={90} />)
                break;
            case 7:
                lines.push(<line key={`crossed-${index}`} style={{ stroke: lineColor, strokeWidth: 0.7 }} x1={10} y1={50} x2={30} y2={50} />)
                break;
            }
        }

        return lines;
    }

    const connectedLines = useMemo(generateConnectedLines, [stones]);

    const [moveToStone, setMoveToStone] = useState(null);

    function playMove(move) {
        switch (move[0]) {
            case 'set': {
                const { color, square, index } = fromBackend(move);
                onCircleClick(square, index);
                break;
            }
            case 'move': {
                const [to, from] = fromBackend(move);
                console.log('from', from)
                console.log('to', to)
                onStoneClick(from.square, from.index, from.color);
                setMoveToStone(to)
                break;
            }
            case 'remove': {
                const { color, square, index } = fromBackend(move);
                onStoneClick(square, index, color === 'white' ? 'black' : 'white');
                break;
            }
        }
    }

    useEffect(() => {
        console.log('move to stone', moveToStone)
        if (moveToStone) {
            onCircleClick(moveToStone.square, moveToStone.index);
        }
        setMoveToStone(null);
    }, [moveToStone])

    function indexToBackendIndex(index) {
        if (index < 3) {
            return [0, index];
        }

        switch (index) {
            case 3:
                return [1, 2];
            case 4:
                return [2, 2];
            case 5:
                return [2, 1];
            case 6:
                return [2, 0];
            case 7:
                return [1, 0];
        }
    }

    function toBackendRepr() {
        // all-zero 3x3x3 matrix
        const matrix = Array(3)
            .fill(null)
            .map(_ => Array(3)
                .fill(null)
                .map(_ => Array(3).fill(0))
            );
        
        let white_count = 0;
        let black_count = 0;
        for (const stone of stones) {
            const { color, square, index } = stone;
            const player = color === 'white' ? 1 : -1;
            const x = square;
            const [y, z] = indexToBackendIndex(index);

            matrix[x][y][z] = player;

            if (player === 1) {
                white_count++;
            } else if (player === -1) {
                black_count++;
            }
        }

        const gameData = {
            stones: matrix,
            difficulty: 'easy',
            line_made: removeStoneMode,
            white_remaining: whiteRemaining,
            black_remaining: blackRemaining,
            white_count,
            black_count,
            player: color === 'white' ? 1 : -1,
            turn: 0,
        }
        
        return gameData
    }

    function fromBackend(move) {
        const [type, player, x, y, z, fromX, fromY, fromZ ] = move;

        if (type === 'set' || type === 'remove') {
            return fromBackendCoordinates(move);
        } else if (type === 'move') {
            const to = fromBackendCoordinates([ type, player, x, y, z ]);
            const from = fromBackendCoordinates([ type, player, fromX, fromY, fromZ ]);
            return [to, from];
        }
    }
    function fromBackendCoordinates(move) {
        const [ type, player, x, y, z ] = move;
        const square = x;
        let index;
        if (y === 0) {
            index = z;
        } else if (y === 1 && z === 0) {
            index = 7;
        } else if (y === 1 && z === 2) {
            index = 3;
        } else if (y === 2 && z === 0) {
            index = 6;
        } else if (y === 2 && z === 1) {
            index = 5;
        } else if (y === 2 && z === 2) {
            index = 4;
        }

        return { color: player === 1 ? 'white' : 'black', square, index };
    }

    useEffect(() => {
        async function getAiMove() {
            console.log('sending request')
            const gameData = toBackendRepr();
            try {
                const response = await axios.post('http://localhost:8000/game/move/', gameData);
                const newMove = response.data;
                console.log(newMove.move)
                playMove(newMove.move);
            } catch (e) {
                console.error(e)
            }
        }
        getAiMove();
    }, [color, removeStoneMode])


    return (
        <div id="game-container">
            <svg viewBox='0 0 100 100'>
                <line className='board-line' x1={50} y1={10} x2={50} y2={30} />
                <line className='board-line' x1={70} y1={50} x2={90} y2={50} />
                <line className='board-line' x1={50} y1={70} x2={50} y2={90} />
                <line className='board-line' x1={10} y1={50} x2={30} y2={50} />
                <BoardSquare padding={10} onCircleClick={onCircleClick} />
                <BoardSquare padding={20} onCircleClick={onCircleClick} />
                <BoardSquare padding={30} onCircleClick={onCircleClick} />
                {/* {...generateConnectedLines()} */}
                {...connectedLines}

                {stones.map(({ square, index, color }) =>
                    <Stone
                         key={`${square}-${index}-${color}`}
                         square={square}
                         index={index}
                         color={color}
                         selected={selectedStone && selectedStone.square === square && selectedStone.index === index && selectedStone.color === color}
                         onStoneClick={onStoneClick}
                    />
                )}
            </svg>
            <div>
                <h3>Current player: {color}</h3>
                <h3>White remaining: {whiteRemaining}</h3>
                <h3>Black remaining: {blackRemaining}</h3>
                <h3>White count: {whiteStonesCount}</h3>
                <h3>Black count: {blackStonesCount}</h3>
                <h3>Jump mode: {JSON.stringify(jumpMode)}</h3>
            </div>
        </div>
    )
}