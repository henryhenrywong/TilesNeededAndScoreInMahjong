from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('tilesNeeded.html')
@app.route('/scoreCalculator')
def scoreCalculator():
    return render_template('scoreCalculator.html')





# Press the green button in the gutter to run the script.
if __name__ == '__main__':
    app.run(host="0.0.0.0")

