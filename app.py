from flask import Flask, render_template

from main import game_of_life_bp

app = Flask(__name__)
app.register_blueprint(game_of_life_bp)


@app.route("/")
def home():
    return render_template("home.html")


@app.route("/js-games")
def js_games():
    return render_template("js_games.html")


if __name__ == "__main__":
    app.run(debug=True)
