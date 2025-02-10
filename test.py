# 1. Функція, яка вітає користувача
def greet(name):
    print(f"Привіт, {name}!")

greet("Аня") # Привіт, Аня!

# 2. Функція, яка знаходить найбільше з трьох чисел
def max_number(a, b, c):
    return max(a, b, c)

print(max_number(5, 10, 3)) # 10

# 3. Функція для обчислення факторіалу числа
def factorial(n):
    result = 1
    for i in range(1, n + 1):
        result *= i
    return result

print(factorial(5)) # 120 (1 * 2 * 3 * 4 * 5 = 120)

# 4. Функції для конвертації температури
def convert_to_fahrenheit(temp):
    return (temp * 1.8) + 32

def convert_to_celsius(temp):
    return (temp - 32) / 1.8

print(convert_to_fahrenheit(0))   # 32.0 (переведення 0°C у °F)
print(convert_to_celsius(100))    # 37.777... (переведення 100°F у °C)
