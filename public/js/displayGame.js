displayGame = (game) => {
    function displayBoard() {

        // Função para criar uma célula de palavras cruzadas
        const createCrosswordCell = (row, column) => {
            const rect = new fabric.Rect({
                left: game.gridSize * column,
                top: game.gridSize * row,
                width: game.gridSize,
                height: game.gridSize,
                stroke: 'black',
                fill: 'transparent',
                strokeWidth: 2,
                lockMovementX: true,
                lockMovementY: true,
                hasControls: false,
                selectable: false,
            });

            const textBox = new fabric.Textbox('', {
                left: game.gridSize * column + 15,
                top: game.gridSize * row + 10,
                fontSize: game.gridSize / 1.6,
                fill: 'black',
                editable: false, // Inicialmente desativado
                hasControls: false,
                backgroundColor: 'transparent',
                stroke: null,
                hasBorders: false,
                transparentCorners: true,
                lockMovementX: true,
                lockMovementY: true,
                selectable: false,
            });

            // Agrupar os elementos relacionados à célula
            const cell = new fabric.Group([rect, textBox], {
                left: game.gridSize * column,
                top: game.gridSize * row,
                lockMovementX: true,
                lockMovementY: true,
                hasControls: false,
                selectable: false,
                evented: true,
                cellName: game.wordLocations[row][column], // Nome para identificar grupos relacionados
            });

            //CLICOU
            cell.on('mousedown', function (e) {
                if (game.activeCell) {
                    return; // Impede a edição de outra célula enquanto há uma ativa
                }
            
                rect.set('fill', 'lightblue');
                
                // Impede o foco automático, removendo a edição direta
                textBox.set('editable', true);
                textBox.enterEditing();
                textBox.selectAll();
                game.activeCell = cell; // Define a célula ativa
            
                // Alterar a cor de todas as células na mesma linha
                game.canvas.getObjects().forEach((obj) => {
                    if (obj.cellName && obj.cellName.split('-').some(element => cell.cellName.split('-').includes(element))) {
                        const rectInRow = obj._objects[0]; // A primeira parte do grupo é o rect
                        rectInRow.set('fill', 'lightgreen');
                    }
                });
            
                game.canvas.renderAll();
            });

            //DIGITOU
            textBox.on('changed', function () {
                // Impede o comportamento de rolagem
                document.body.style.overflow = 'hidden';
            
                // Remove caracteres não permitidos
                textBox.text = textBox.text.replace(/[^a-zA-ZáàäâãéèëêíìïîóòöôõúùüûçÇ]/g, '');
            
                // Adiciona um atraso para sair da edição, evitando o foco indesejado
                setTimeout(() => {
                    textBox.exitEditing();
                    game.userInput[row][column] = this.text;
            
                    // Alterar a cor de todas as células na mesma linha
                    game.canvas.getObjects().forEach((obj) => {
                        if (obj.cellName && obj.cellName.split('-').some(element => cell.cellName.split('-').includes(element))) {
                            const rectInRow = obj._objects[0]; // A primeira parte do grupo é o rect
                            rectInRow.set('fill', 'white'); // Altere a cor desejada para as células na linha
                        }
                    });
            
                    rect.set('fill', 'transparent');
                    textBox.set('editable', false);
                    game.activeCell = null; // Libera a célula ativa
                    game.canvas.renderAll();
            
                    // Restaura o comportamento normal de rolagem após a edição
                    document.body.style.overflow = '';
                }, 50); // Adiciona um pequeno atraso para permitir que a rolagem não aconteça
            
            });
            

            game.canvas.add(cell);
        };

        const createWordLabel = (row, column, word) => {
            const wordText = String(game.placedWords.indexOf(word) + 1)
            const wordLabel = new fabric.Text(wordText, {
                left: game.gridSize * column + 5,
                top: game.gridSize * row,
                fontSize: game.gridSize / 3,
                fill: 'red',
                editable: false,
                hasControls: false,
                lockMovementX: true,
                lockMovementY: true,
                selectable: false
            });
            game.canvas.add(wordLabel);
        }

        // Renderizar o tabuleiro
        game.board.forEach((row, rowIndex) => {
            row.forEach((char, colIndex) => {
                if (char !== ' ') {
                    // Criar a célula do caractere
                    createCrosswordCell(rowIndex, colIndex);

                    // Adiciona word label, se for o primeiro caractere da palavra
                    for (let word of game.placedWords) {
                        if (word.row === rowIndex && word.column === colIndex) {
                            createWordLabel(rowIndex, colIndex, word);
                        }
                    }
                }
            });
        });
    }

    function displayClues(ol) {
        game.placedWords.forEach(entry => {
            const newLi = document.createElement('li');
            newLi.innerHTML = `${entry.clue} (${entry.direction}) - Posição: (${entry.row}, ${entry.column})`;
            ol.append(newLi);
        });
    }

    const container = document.querySelector('#game-container');
    container.innerHTML = `
      <div>
        <p>Game Board</p>
        <canvas width="${game.canvasSize}" height="${game.canvasSize}" id="game-board">The game is loading or can't load on your browser.</canvas>
      </div>
      <div>
        <p>Game Clues</p>
        <ol id="game-clues"></ol>
      </div>
    `;
    game.canvas = new fabric.Canvas(document.querySelector('#game-board'));
    game.canvas.hoverCursor = 'default';
    displayBoard();
    displayClues(document.querySelector('#game-clues'));
}