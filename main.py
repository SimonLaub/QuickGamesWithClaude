import random

from flask import Blueprint, jsonify, render_template, request

ROWS = 20
COLS = 40
ALIVE_CHANCE = 0.2
CELL_SIZE = 18
DELAY_MS = 150

game_of_life_bp = Blueprint("game_of_life", __name__)


def random_board(rows=ROWS, cols=COLS, alive_chance=ALIVE_CHANCE):
    return [
        [1 if random.random() < alive_chance else 0 for _ in range(cols)]
        for _ in range(rows)
    ]


def count_neighbors(board, row, col):
    rows = len(board)
    cols = len(board[0])
    count = 0
    for dr in (-1, 0, 1):
        for dc in (-1, 0, 1):
            if dr == 0 and dc == 0:
                continue
            r, c = row + dr, col + dc
            if 0 <= r < rows and 0 <= c < cols:
                count += board[r][c]
    return count


def next_generation(board):
    rows = len(board)
    cols = len(board[0])
    new_board = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            neighbors = count_neighbors(board, r, c)
            if board[r][c] == 1:
                new_board[r][c] = 1 if neighbors in (2, 3) else 0
            else:
                new_board[r][c] = 1 if neighbors == 3 else 0
    return new_board


@game_of_life_bp.route("/game-of-life")
def game_of_life():
    board = random_board()
    return render_template(
        "game_of_life.html",
        board=board,
        rows=ROWS,
        cols=COLS,
        cell_size=CELL_SIZE,
        delay_ms=DELAY_MS,
    )


@game_of_life_bp.route("/game-of-life/random")
def game_of_life_random():
    return jsonify(board=random_board())


@game_of_life_bp.route("/game-of-life/step", methods=["POST"])
def game_of_life_step():
    board = request.get_json()["board"]
    return jsonify(board=next_generation(board))
