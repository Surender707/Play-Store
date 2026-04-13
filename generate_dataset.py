import csv
import random
import os

random.seed(42)

CATEGORIES = [
    "Art & Design", "Auto & Vehicles", "Beauty", "Books & Reference",
    "Business", "Comics", "Communication", "Dating", "Education",
    "Entertainment", "Events", "Finance", "Food & Drink", "Health & Fitness",
    "House & Home", "Libraries & Demo", "Lifestyle", "Game", "Maps & Navigation",
    "Medical", "Music & Audio", "News & Magazines", "Parenting", "Personalization",
    "Photography", "Productivity", "Shopping", "Social", "Sports", "Tools",
    "Travel & Local", "Video Players", "Weather"
]

CONTENT_RATINGS = ["Everyone", "Teen", "Everyone 10+", "Mature 17+", "Adults only 18+", "Unrated"]
TYPES = ["Free", "Paid"]
GENRES_MAP = {
    "Game": ["Action", "Adventure", "Arcade", "Board", "Card", "Casino", "Casual",
             "Educational", "Music", "Puzzle", "Racing", "Role Playing", "Simulation",
             "Sports", "Strategy", "Trivia", "Word"],
    "Education": ["Education", "Educational"],
    "Entertainment": ["Entertainment"],
    "Business": ["Business"],
    "Productivity": ["Productivity"],
    "Tools": ["Tools"],
    "Communication": ["Communication"],
    "Social": ["Social"],
    "Photography": ["Photography"],
    "Shopping": ["Shopping"],
    "Finance": ["Finance"],
    "Health & Fitness": ["Health & Fitness"],
    "Music & Audio": ["Music & Audio"],
    "News & Magazines": ["News & Magazines"],
    "Travel & Local": ["Travel & Local"],
    "Sports": ["Sports"],
    "Food & Drink": ["Food & Drink"],
    "Lifestyle": ["Lifestyle"],
    "Personalization": ["Personalization"],
    "Books & Reference": ["Books & Reference"],
    "Video Players": ["Video Players & Editors"],
    "Medical": ["Medical"],
    "Maps & Navigation": ["Maps & Navigation"],
    "Dating": ["Dating"],
    "Weather": ["Weather"],
    "Events": ["Events"],
    "Art & Design": ["Art & Design"],
    "Comics": ["Comics"],
    "Beauty": ["Beauty"],
    "Parenting": ["Parenting"],
    "Auto & Vehicles": ["Auto & Vehicles"],
    "House & Home": ["House & Home"],
    "Libraries & Demo": ["Libraries & Demo"],
}

APP_NAME_PREFIXES = [
    "Smart", "Pro", "Super", "Ultra", "Mega", "Quick", "Easy", "Fast",
    "My", "Best", "Top", "Cool", "Fun", "Happy", "Magic", "Power",
    "Turbo", "Zen", "Go", "Mini", "Max", "Prime", "Elite", "Royal"
]

APP_NAME_SUFFIXES = [
    "Hub", "Lab", "Box", "Plus", "Lite", "Master", "Studio", "Cloud",
    "Zone", "World", "Space", "Frame", "Track", "Flow", "Sync", "Point",
    "Link", "Net", "App", "Tools", "Manager", "Helper", "Guide", "Pro"
]

APP_NAME_WORDS = {
    "Game": ["Battle", "Quest", "War", "Craft", "Run", "Jump", "Clash", "Hero", "Dragon", "Star"],
    "Education": ["Learn", "Study", "Quiz", "Math", "Science", "Language", "School", "Tutor", "Brain", "IQ"],
    "Social": ["Chat", "Connect", "Meet", "Share", "Friend", "Circle", "Vibe", "Hang", "Talk", "Wave"],
    "Photography": ["Photo", "Camera", "Filter", "Snap", "Pic", "Shot", "Edit", "Lens", "Image", "Gallery"],
    "Shopping": ["Shop", "Deal", "Cart", "Buy", "Sale", "Market", "Store", "Price", "Offer", "Trade"],
    "Finance": ["Money", "Bank", "Pay", "Wallet", "Budget", "Cash", "Invest", "Crypto", "Stock", "Coin"],
    "Health & Fitness": ["Fit", "Health", "Yoga", "Gym", "Run", "Diet", "Workout", "Step", "Cardio", "Body"],
    "default": ["Data", "Info", "Core", "Base", "Tech", "Pixel", "Byte", "Grid", "Pulse", "Edge"]
}

ANDROID_VERSIONS = [
    "4.1 and up", "4.2 and up", "4.3 and up", "4.4 and up",
    "5.0 and up", "5.1 and up", "6.0 and up", "7.0 and up",
    "7.1 and up", "8.0 and up", "8.1 and up", "9.0 and up",
    "Varies with device"
]

LAST_UPDATED_YEARS = ["2023", "2024", "2025", "2026"]
MONTHS = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]


def generate_app_name(category):
    words = APP_NAME_WORDS.get(category, APP_NAME_WORDS["default"])
    style = random.choice(["prefix_word", "word_suffix", "prefix_word_suffix", "word_only"])
    if style == "prefix_word":
        return f"{random.choice(APP_NAME_PREFIXES)} {random.choice(words)}"
    elif style == "word_suffix":
        return f"{random.choice(words)} {random.choice(APP_NAME_SUFFIXES)}"
    elif style == "prefix_word_suffix":
        return f"{random.choice(APP_NAME_PREFIXES)} {random.choice(words)} {random.choice(APP_NAME_SUFFIXES)}"
    else:
        return f"{random.choice(words)}{random.choice(APP_NAME_SUFFIXES)}"


def generate_installs():
    ranges = [
        (0, "0+", 0.01), (1, "1+", 0.02), (5, "5+", 0.02), (10, "10+", 0.05),
        (50, "50+", 0.03), (100, "100+", 0.08), (500, "500+", 0.05),
        (1000, "1,000+", 0.12), (5000, "5,000+", 0.08),
        (10000, "10,000+", 0.15), (50000, "50,000+", 0.10),
        (100000, "100,000+", 0.12), (500000, "500,000+", 0.06),
        (1000000, "1,000,000+", 0.06), (5000000, "5,000,000+", 0.03),
        (10000000, "10,000,000+", 0.015), (50000000, "50,000,000+", 0.005),
        (100000000, "100,000,000+", 0.003), (500000000, "500,000,000+", 0.001),
        (1000000000, "1,000,000,000+", 0.001)
    ]
    nums, labels, weights = zip(*ranges)
    return random.choices(list(zip(nums, labels)), weights=weights, k=1)[0]


def generate_reviews(installs_num):
    if installs_num == 0:
        return 0
    ratio = random.uniform(0.001, 0.05)
    return max(0, int(installs_num * ratio * random.uniform(0.5, 1.5)))


def generate_rating(installs_num, is_paid, reviews):
    base = random.gauss(4.0, 0.5)
    if is_paid:
        base += random.uniform(0.1, 0.3)
    if installs_num > 1000000:
        base += random.uniform(0.05, 0.15)
    if reviews == 0:
        return round(max(1.0, min(5.0, random.uniform(1.0, 5.0))), 1)
    return round(max(1.0, min(5.0, base)), 1)


def generate_size():
    size_type = random.choices(["small", "medium", "large", "varies"], weights=[0.3, 0.4, 0.2, 0.1])[0]
    if size_type == "small":
        return f"{random.uniform(0.1, 10):.1f}M"
    elif size_type == "medium":
        return f"{random.uniform(10, 50):.0f}M"
    elif size_type == "large":
        return f"{random.uniform(50, 100):.0f}M"
    else:
        return "Varies with device"


def generate_price(is_paid):
    if not is_paid:
        return "0"
    prices = [0.99, 1.49, 1.99, 2.49, 2.99, 3.49, 3.99, 4.99, 5.99, 6.99, 7.99, 9.99, 14.99, 19.99, 29.99]
    return str(random.choice(prices))


def generate_last_updated():
    year = random.choice(LAST_UPDATED_YEARS)
    month = random.choice(MONTHS)
    day = random.randint(1, 28)
    return f"{month} {day}, {year}"


def main():
    num_apps = 10841
    apps = []
    used_names = set()

    for i in range(num_apps):
        category = random.choice(CATEGORIES)
        
        name = generate_app_name(category)
        counter = 0
        while name in used_names and counter < 100:
            name = generate_app_name(category)
            counter += 1
        if name in used_names:
            name = f"{name} {random.randint(1, 9999)}"
        used_names.add(name)

        is_paid = random.random() < 0.07
        app_type = "Paid" if is_paid else "Free"
        price = generate_price(is_paid)

        installs_num, installs_label = generate_installs()
        reviews = generate_reviews(installs_num)
        rating = generate_rating(installs_num, is_paid, reviews)

        if reviews == 0 and random.random() < 0.05:
            rating = "NaN"

        size = generate_size()
        content_rating = random.choices(CONTENT_RATINGS, weights=[0.55, 0.15, 0.15, 0.1, 0.02, 0.03])[0]

        genres_list = GENRES_MAP.get(category, [category])
        genre = random.choice(genres_list)
        if category == "Game":
            genre = f"Game;{genre}" if random.random() < 0.5 else genre

        last_updated = generate_last_updated()
        android_ver = random.choice(ANDROID_VERSIONS)

        apps.append({
            "App": name,
            "Category": category,
            "Rating": rating,
            "Reviews": reviews,
            "Size": size,
            "Installs": installs_label,
            "Type": app_type,
            "Price": price,
            "Content Rating": content_rating,
            "Genres": genre,
            "Last Updated": last_updated,
            "Current Ver": f"{random.randint(1, 20)}.{random.randint(0, 9)}.{random.randint(0, 99)}",
            "Android Ver": android_ver,
        })

    output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "google_playstore_apps.csv")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=[
            "App", "Category", "Rating", "Reviews", "Size", "Installs",
            "Type", "Price", "Content Rating", "Genres", "Last Updated",
            "Current Ver", "Android Ver"
        ])
        writer.writeheader()
        writer.writerows(apps)

    print(f"Dataset generated successfully with {len(apps)} apps at: {output_path}")


if __name__ == "__main__":
    main()
