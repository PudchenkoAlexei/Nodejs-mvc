# Пудченко Олексій ІМ-23

# Nodejs-mvc

У моєму проєкті реалізована архітектура MVC, яка розділяє код на три чіткі частини: Model, View і Controller з додатковими патернами для покращення структури та функціональності.

## Model

Модель представлена класом `User`, який визначає структуру користувача в базі даних та відповідає за збереження даних. Для гнучкого створення користувачів реалізований патерн Builder через клас `UserBuilder`, який дозволяє поетапно налаштовувати властивості користувача з валідацією на кожному кроці. Додатково використовується патерн Director через клас `UserDirector`, який надає зручні методи для створення типових варіантів користувачів з параметрами за замовчуванням або кастомними налаштуваннями.

## View

Представлення (View) складається з файлів `.ejs`, які відповідають за інтерфейс користувача. Основні шаблони включають сторінки реєстрації (`register.ejs`), входу (`login.ejs`), головну сторінку (`home.ejs`) та панель користувача (`dashboard.ejs`). Ці шаблони отримують дані від контролерів та відображають їх у зрозумілому для користувача вигляді, включаючи обробку помилок та збереження введених даних при валідації.

## Controller

Контролери структуровані з використанням патерну Command, який інкапсулює бізнес-логіку в окремі класи команд. Замість того, щоб контролери `registerUser` та `loginUser` містили всю логіку обробки, вони створюють відповідні команди `RegisterUserCommand` та `LoginUserCommand`, які виконують всю складну роботу. Контролери відповідають лише за витягування даних з HTTP-запитів, створення команд з цими даними та ініціювання їх виконання через метод `execute()`.

Команди містять повну бізнес-логіку, включаючи валідацію даних, взаємодію з базою даних, хешування паролів, обробку помилок та рендеринг відповідних представлень. Такий підхід забезпечує чітке відокремлення обробки HTTP-запитів від бізнес-логіки, роблячи код більш організованим та тестованим.

# Builder Pattern

Для створення об'єкта користувача використовується патерн Builder, який дозволяє поетапно будувати об'єкт замість передачі всіх параметрів одразу у конструктор. Це робить код більш гнучким та читабельним.

Основний клас `UserBuilder` реалізований у файлі `User.js` та відповідає за поетапне створення користувача:

```javascript
class UserBuilder {
  constructor(name, email, password) {
    if (!name || !email || !password) {
      throw new Error('Name, email, and password are required');
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      throw new Error('Invalid email format');
    }
    this.userData = { name, email, password };
  }

  setLocation(location) {
    if (location && typeof location !== 'string') {
      throw new Error('Location must be a string');
    }
    this.userData.location = location || 'Kyiv';
    return this;
  }

  setDate(date) {
    if (date && !(date instanceof Date)) {
      throw new Error('Date must be a valid Date object');
    }
    this.userData.date = date || new Date();
    return this;
  }

  build() {
    return new User(this.userData);
  }
}
```

Конструктор приймає три обов'язкові параметри та виконує їх валідацію. Якщо будь-який з параметрів відсутній, викидається помилка. Також перевіряється формат email за допомогою регулярного виразу. Після успішної валідації дані зберігаються в об'єкті `userData`.

Метод `setLocation` встановлює локацію користувача з додатковою валідацією типу. Якщо локація не передана або є порожньою, автоматично встановлюється значення 'Kyiv'. Метод повертає `this`, що дозволяє використовувати ланцюгові виклики.

Аналогічно працює метод `setDate`, який встановлює дату створення користувача. Якщо дата не передана, використовується поточна дата. Валідація перевіряє, чи переданий об'єкт є екземпляром Date.

Завершальний метод `build()` створює новий екземпляр User, передаючи накопичені дані з `userData` у конструктор основного класу.

Для спрощення створення типових варіантів користувачів реалізований клас `UserDirector`:

```javascript
class UserDirector {
  static createDefaultUser(name, email, password) {
    return new UserBuilder(name, email, password)
      .setLocation('Kyiv')
      .setDate(new Date())
      .build();
  }

  static createCustomUser(name, email, password, location, date) {
    return new UserBuilder(name, email, password)
      .setLocation(location)
      .setDate(date)
      .build();
  }
}
```

Метод `createDefaultUser` створює користувача з параметрами за замовчуванням, автоматично встановлюючи локацію 'Kyiv' та поточну дату. Метод `createCustomUser` дозволяє передати кастомні значення для всіх властивостей користувача.

У файлі `loginController.js` в класі `RegisterUserCommand` патерн Builder використовується для створення нового користувача під час реєстрації:

```javascript
const newUser = User.Director.createCustomUser(
  this.name,
  this.email,
  this.password,
  this.location,
  new Date()
);
```

Цей код використовує Director для створення користувача з даними, отриманими з форми реєстрації. Альтернативно, можна використовувати Builder безпосередньо:

```javascript
const newUser = new User.Builder(this.name, this.email, this.password)
  .setLocation(this.location)
  .setDate(new Date())
  .build();
```

Обидва підходи дають однаковий результат, але Director робить код більш лаконічним для типових випадків використання.

Builder та Director інтегровані в основний клас User як статичні властивості:

```javascript
User.Builder = UserBuilder;
User.Director = UserDirector;

module.exports = User;
```

Це дозволяє використовувати їх як `User.Builder()` та `User.Director.createDefaultUser()`, зберігаючи всю функціональність створення користувачів в одному місці. Таким чином, коли потрібно створити користувача, можна імпортувати лише основний клас User та мати доступ до всіх можливостей створення об'єктів.

Патерн Builder особливо корисний у цьому контексті, оскільки модель User має як обов'язкові поля (name, email, password), так і опціональні (location, date) зі значеннями за замовчуванням. Це дозволяє гнучко керувати процесом створення та легко розширювати функціональність у майбутньому без зміни існуючого коду.

# Command Pattern

Для обробки операцій реєстрації та входу користувачів використовується патерн Command, який інкапсулює запит як об'єкт. Це дозволяє відокремити код, що ініціює запит, від коду, що його обробляє, роблячи систему більш гнучкою та розширюваною.

Клас `RegisterUserCommand` у файлі `loginController.js` інкапсулює всю логіку реєстрації нового користувача:

```javascript
class RegisterUserCommand {
  constructor({ name, email, location, password, confirm, res }) {
    this.name = name;
    this.email = email;
    this.password = password;
    this.confirm = confirm;
    this.location = location;
    this.res = res;
  }

  execute() {
    if (!this.name || !this.email || !this.password || !this.confirm) {
      return this.res.render("register", {
        error: 'Please fill in all fields',
        name: this.name,
        email: this.email,
        password: this.password,
        confirm: this.confirm
      });
    }

    if (this.password !== this.confirm) {
      return this.res.render("register", {
        error: 'Passwords must match',
        name: this.name,
        email: this.email,
        password: this.password,
        confirm: this.confirm
      });
    }

    User.findOne({ email: this.email }).then((user) => {
      if (user) {
        return this.res.render("register", {
          error: 'Email already exists',
          name: this.name,
          email: this.email,
          password: this.password,
          confirm: this.confirm
        });
      }

      const newUser = User.Director.createCustomUser(
        this.name,
        this.email,
        this.password,
        this.location,
        new Date()
      );

      bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            return this.res.render("register", {
              error: 'Error hashing password',
              name: this.name,
              email: this.email,
              password: this.password,
              confirm: this.confirm
            });
          }
          newUser.password = hash;
          newUser.save()
            .then(() => this.res.redirect("/login"))
            .catch(err => {
              return this.res.render("register", {
                error: 'Error saving user',
                name: this.name,
                email: this.email,
                password: this.password,
                confirm: this.confirm
              });
            });
        })
      );
    });
  }
}
```

Конструктор команди приймає об'єкт з усіма необхідними параметрами, включаючи дані форми та об'єкт відповіді Express. Всі параметри зберігаються як властивості екземпляра для подальшого використання в методі `execute()`.

Метод `execute()` містить всю бізнес-логіку реєстрації користувача. Спочатку виконується валідація вхідних даних, перевіряючи наявність всіх обов'язкових полів. Якщо якесь поле порожнє, користувач повертається на сторінку реєстрації з повідомленням про помилку та збереженими даними форми.

Далі перевіряється відповідність паролів. Якщо паролі не співпадають, також відображається сторінка з помилкою. Після базової валідації виконується запит до бази даних для перевірки унікальності email. Якщо користувач з таким email вже існує, відображається відповідне повідомлення про помилку.

При успішній валідації створюється новий користувач за допомогою патерну Builder через `User.Director.createCustomUser()`. Пароль хешується за допомогою bcrypt з випадковою сіллю, після чого користувач зберігається в базі даних. При успішному збереженні відбувається перенаправлення на сторінку входу.

Клас `LoginUserCommand` обробляє логіку входу користувача в систему:

```javascript
class LoginUserCommand {
  constructor({ email, password, req, res }) {
    this.email = email;
    this.password = password;
    this.req = req;
    this.res = res;
  }

  execute() {
    if (!this.email || !this.password) {
      return this.res.render('login', {
        error: 'Please fill in all the fields',
        email: this.email,
        password: this.password
      });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return this.res.render('login', {
          error: 'Authentication error',
          email: this.email,
          password: this.password
        });
      }
      if (!user) {
        return this.res.render('login', {
          error: info.message || 'Invalid email or password',
          email: this.email,
          password: this.password
        });
      }
      this.req.logIn(user, (err) => {
        if (err) {
          return this.res.render('login', {
            error: 'Login error',
            email: this.email,
            password: this.password
          });
        }
        return this.res.redirect('/dashboard');
      });
    })(this.req, this.res);
  }
}
```

Конструктор `LoginUserCommand` приймає менше параметрів порівняно з командою реєстрації, оскільки для входу потрібні лише email, пароль та об'єкти запиту і відповіді Express.

Метод `execute()` спочатку перевіряє наявність обох обов'язкових полів. Якщо email або пароль відсутні, користувач повертається на сторінку входу з повідомленням про помилку.

Основна логіка аутентифікації делегується Passport.js через `passport.authenticate()`. Використовується локальна стратегія аутентифікації, яка перевіряє email та пароль користувача. Метод викликається з колбек-функцією, яка обробляє різні сценарії результату аутентифікації.

Якщо під час аутентифікації виникла помилка, відображається сторінка входу з повідомленням про помилку аутентифікації. Якщо користувач не знайдений або пароль неправильний, використовується повідомлення з об'єкта `info` або стандартне повідомлення про невірні дані.

При успішній аутентифікації викликається `req.logIn()` для встановлення сесії користувача. Якщо логін пройшов успішно, користувач перенаправляється на панель управління, інакше відображається повідомлення про помилку входу.

У функціях контролера команди створюються та виконуються наступним чином:

```javascript
const registerUser = (req, res) => {
  const { name, email, location, password, confirm } = req.body;

  const command = new RegisterUserCommand({
    name, email, location, password, confirm, res
  });

  command.execute();
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  const command = new LoginUserCommand({
    email, password, req, res
  });

  command.execute();
};
```

Функція `registerUser` витягує необхідні дані з тіла запиту, створює екземпляр `RegisterUserCommand` з цими даними та викликає метод `execute()`. Аналогічно працює функція `loginUser` з командою входу.

Такий підхід відокремлює логіку обробки HTTP запитів від бізнес-логіки операцій. Контролер відповідає лише за витягування даних з запиту та створення команд, а вся складна логіка інкапсульована всередині команд. Це робить код більш організованим, тестованим та дозволяє легко додавати нові операції без зміни структури контролера.

# Теорія
Патерни проектування — це такі готові рішення для типових проблем, з якими стикаються програмісти під час створення програм. Вони допомагають писати код, який легко розуміти, змінювати і підтримувати. Патерни — це як шаблони, які можна використовувати багато разів у різних проєктах.

Є три основні типи патернів: ті, що допомагають створювати об’єкти (їх називають порожні), ті, що допомагають організувати взаємодію між класами і об’єктами (структурні), і ті, що допомагають організувати поведінку об’єктів, тобто як вони спілкуються між собою (поведінкові).

Ось основні патерни, які бувають:

Порожні (створення об’єктів):

Singleton (одиночка) — гарантує, що буде тільки один об’єкт певного класу.

Factory Method (фабричний метод) — створює об’єкти, але дозволяє підкласам вирішувати, який саме об’єкт створювати.

Abstract Factory (абстрактна фабрика) — створює сімейства пов’язаних об’єктів.

Builder (будівельник) — поступове створення складного об’єкта.

Prototype (прототип) — створення нових об’єктів копіюванням існуючих.

Структурні (організація об’єктів):

Adapter (адаптер) — дозволяє класам з різними інтерфейсами працювати разом.

Composite (композит) — представляє групу об’єктів як один об’єкт.

Decorator (декоратор) — додає нову поведінку об’єктам без зміни їх коду.

Facade (фасад) — спрощує складну систему, даючи простий інтерфейс.

Proxy (проксі) — створює замінник об’єкта, який контролює доступ до нього.

Поведінкові (взаємодія об’єктів):

Observer (спостерігач) — дозволяє повідомляти залежні об’єкти про зміни.

Strategy (стратегія) — дає змогу змінювати поведінку об’єкта під час роботи.

Command (команда) — інкапсулює запит як об’єкт, що дозволяє відкладати або чергувати дії.

Iterator (ітератор) — забезпечує послідовний доступ до елементів колекції.

State (стан) — змінює поведінку об’єкта залежно від його стану.

Це лише частина з усіх патернів, але вони найпопулярніші і найчастіше використовуються.
