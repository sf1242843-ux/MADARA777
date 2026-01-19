import random

# 50 Truths
truths = [
    "What's your biggest fear?",
    "Have you ever lied to your best friend?",
    "What's the most embarrassing thing you've done?",
    "Who do you have a crush on?",
    "What's your secret talent?",
    "Have you ever cheated on a test?",
    "What's your worst habit?",
    "Who is your childhood crush?",
    "What's the weirdest dream you've had?",
    "Have you ever stolen anything?",
    "What's your guilty pleasure?",
    "Have you ever been caught lying?",
    "What's your biggest insecurity?",
    "What's the most trouble you've gotten into?",
    "Who do you secretly dislike?",
    "What's the most childish thing you still do?",
    "Have you ever cried in public?",
    "What's the longest you've gone without showering?",
    "What's a secret you've never told anyone?",
    "Who do you admire the most?",
    "Have you ever had a crush on a teacher?",
    "What's the worst date you've been on?",
    "What's your weirdest habit?",
    "Have you ever pretended to like someone?",
    "What's the most embarrassing text you've sent?",
    "Have you ever peed in a pool?",
    "What's the dumbest thing you've done for love?",
    "Have you ever faked being sick?",
    "What's your worst lie ever?",
    "Who was your first crush?",
    "Have you ever lied about your age?",
    "What's the most awkward thing in your room?",
    "Who do you stalk on social media?",
    "Have you ever snooped through someone's stuff?",
    "What's your weirdest fear?",
    "Have you ever laughed at the wrong time?",
    "What's your favorite secret snack?",
    "Have you ever cheated in a game?",
    "What's your most embarrassing habit?",
    "Who do you wish you could be friends with?",
    "Have you ever been rejected?",
    "What's a secret talent you have?",
    "What's the most awkward situation you've been in?",
    "Have you ever lied to your parents?",
    "What's the weirdest rumor you've heard about yourself?",
    "What's your most embarrassing nickname?",
    "Have you ever cried over a movie?",
    "What's the funniest thing that happened at school?",
    "Have you ever pretended to be someone else online?"
]

# 50 Dares
dares = [
    "Do 10 push-ups.",
    "Sing a song loudly.",
    "Post a funny selfie on social media.",
    "Dance for 30 seconds.",
    "Act like a cat for 1 minute.",
    "Do your best impression of a celebrity.",
    "Speak in a foreign accent for 5 minutes.",
    "Do 20 jumping jacks.",
    "Try to lick your elbow.",
    "Wear socks on your hands for 10 minutes.",
    "Talk without closing your mouth for 1 minute.",
    "Do your best dance move.",
    "Say the alphabet backwards.",
    "Act like a zombie for 1 minute.",
    "Pretend to be a superhero.",
    "Make a funny face and hold it for 30 seconds.",
    "Do an impression of a teacher or parent.",
    "Recite a poem dramatically.",
    "Try to juggle 2 items.",
    "Do your best animal sound.",
    "Spin around 5 times and walk straight.",
    "Eat something without using your hands.",
    "Do a plank for 30 seconds.",
    "Hop on one foot for 1 minute.",
    "Try to whistle a song.",
    "Do 10 squats.",
    "Pretend to be a robot.",
    "Say a tongue twister 3 times fast.",
    "Draw a self-portrait with your eyes closed.",
    "Speak only in questions for 2 minutes.",
    "Pretend you're a famous singer.",
    "Do a silly dance in public.",
    "Try to touch your toes without bending your knees.",
    "Do 5 push-ups on your knees.",
    "Make a funny hat with anything nearby.",
    "Do an impression of a baby crying.",
    "Balance a book on your head for 1 minute.",
    "Make a paper airplane and fly it.",
    "Pretend to swim on dry land.",
    "Do a dramatic reading of a random text.",
    "Try to say your name backwards.",
    "Act like a monkey for 1 minute.",
    "Make a funny animal sound.",
    "Do a handstand against a wall.",
    "Pretend you're in a cooking show.",
    "Sing the chorus of your favorite song loudly.",
    "Draw something with your non-dominant hand.",
    "Do a silly walk across the room.",
    "Pretend to be a news reporter.",
    "Try to balance on one leg for 1 minute."
]

def TnD_bot():
    print("Welcome to Truth & Dare Bot! Type '/Truth' or '/Dare' or 'exit' to quit.")

    while True:
        cmd = input("Command: ").strip().lower()
        
        if cmd == "/truth":
            print("Truth: " + random.choice(truths))
        elif cmd == "/dare":
            print("Dare: " + random.choice(dares))
        elif cmd == "exit":
            print("Thanks for playing! Bye!")
            break
        else:
            print("Unknown command. Type '/Truth', '/Dare', or 'exit'.")

if __name__ == "__main__":
    TnD_bot()
