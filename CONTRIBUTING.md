# Contributing to Foodie Find Match

Thank you for your interest in contributing to Foodie Find Match! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/foodie-find-match.git
   cd foodie-find-match
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Code Style

### TypeScript
- Use TypeScript for all new code
- Provide proper type definitions
- Avoid `any` types when possible
- Use interfaces for object shapes

### React
- Use functional components with hooks
- Follow React best practices
- Use proper prop types and interfaces
- Keep components focused and reusable

### Styling
- Use Tailwind CSS for styling
- Follow the existing design system
- Use shadcn/ui components when possible
- Maintain responsive design

## 🧪 Testing

### Running Tests
```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Quality
- All code should pass ESLint
- Follow the existing code style
- Write meaningful commit messages
- Test your changes thoroughly

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests if applicable
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**
   - Provide a clear description of your changes
   - Include screenshots if UI changes
   - Reference any related issues

## 📋 Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(swipe): add haptic feedback on mobile
fix(room): resolve real-time sync issues
docs(readme): update installation instructions
```

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Environment details**
   - OS and version
   - Browser and version
   - Node.js version

2. **Steps to reproduce**
   - Clear, step-by-step instructions
   - Expected vs actual behavior

3. **Additional context**
   - Screenshots if applicable
   - Console errors
   - Network tab information

## 💡 Feature Requests

When suggesting features:

1. **Describe the problem**
   - What issue does this solve?
   - Who would benefit from this?

2. **Propose a solution**
   - How should this work?
   - Any technical considerations?

3. **Consider alternatives**
   - Are there existing solutions?
   - Could this be implemented differently?

## 📞 Getting Help

- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Code Review**: All PRs will be reviewed by maintainers

## 🎯 Project Goals

Our mission is to make group dining decisions easier and more enjoyable. We focus on:

- **User Experience**: Intuitive, accessible, and delightful
- **Performance**: Fast, responsive, and reliable
- **Collaboration**: Real-time, seamless group coordination
- **Accessibility**: Inclusive design for all users

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Foodie Find Match! 🍽️ 