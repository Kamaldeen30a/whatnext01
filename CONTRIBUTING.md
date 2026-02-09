# Contributing to whatnext01

Thank you for your interest in contributing to this project! We welcome contributions from the community.

## How to Contribute

### Reporting Issues

If you find a bug or have a suggestion for improvement:

1. Check if the issue already exists in the [Issues](https://github.com/Kamaldeen30a/whatnext01/issues) section
2. If not, create a new issue with a clear title and description
3. Include steps to reproduce the issue (if applicable)
4. Add relevant labels to help categorize the issue

### Submitting Changes

1. **Fork the Repository**
   - Fork this repository to your GitHub account
   - Clone your fork locally

2. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Write clear, concise code
   - Follow the existing code style
   - Add comments where necessary
   - Update documentation if needed

4. **Test Your Changes**
   ```bash
   npm install
   npm run dev
   npm run build
   npm run lint
   ```

5. **Commit Your Changes**
   - Write clear commit messages
   - Use conventional commit format when possible
   ```bash
   git commit -m "feat: add new feature"
   ```

6. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Provide a clear description of your changes
   - Reference any related issues

## Development Setup

This project requires Node.js and npm. To set up your development environment:

```bash
# Clone the repository
git clone https://github.com/Kamaldeen30a/whatnext01.git

# Navigate to the project directory
cd whatnext01

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Code Style

- Follow the existing code style in the project
- Use TypeScript for type safety
- Run ESLint before committing: `npm run lint`
- Format your code consistently

## Pull Request Guidelines

- Keep pull requests focused on a single feature or fix
- Update the README.md if you add functionality
- Ensure all tests pass before submitting
- Be responsive to feedback and questions
- Be patient - maintainers will review your PR as soon as possible

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label.

Thank you for contributing! 🎉
