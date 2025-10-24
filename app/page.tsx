import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-primary to-primary-light text-white">
        <div className="container-app py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4">Agile Self</h1>
            <p className="text-2xl mb-2 text-secondary-light">Your AI Growth Partner</p>
            <p className="text-xl mb-8 opacity-90">Turn Reflection Into Action</p>
            <p className="text-lg mb-10 opacity-80">
              A simple, powerful tool for personal retrospectives using the KPTA framework.
              Reflect weekly or monthly, identify patterns, and create concrete action plans for growth.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/signup" className="btn btn-secondary text-lg px-8 py-3">
                Get Started Free
              </Link>
              <Link href="/auth/login" className="btn btn-outline text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* KPTA Framework Section */}
      <section className="py-20 bg-white">
        <div className="container-app">
          <h2 className="text-4xl font-bold text-center mb-4">The KPTA Framework</h2>
          <p className="text-center text-lg text-gray-600 mb-16 max-w-2xl mx-auto">
            A structured approach to self-reflection that turns insights into actionable steps
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Keep */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="text-2xl font-semibold mb-3 text-status-success">Keep</h3>
              <p className="text-gray-600">
                What went well? What positive habits or events should I continue?
              </p>
            </div>

            {/* Problem */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🚧</div>
              <h3 className="text-2xl font-semibold mb-3 text-status-warning">Problem</h3>
              <p className="text-gray-600">
                What obstacles or challenges did I face? What's holding me back?
              </p>
            </div>

            {/* Try */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔬</div>
              <h3 className="text-2xl font-semibold mb-3 text-secondary">Try</h3>
              <p className="text-gray-600">
                Based on the problems and keeps, what is a new approach I can experiment with?
              </p>
            </div>

            {/* Action */}
            <div className="card hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-semibold mb-3 text-primary">Action</h3>
              <p className="text-gray-600">
                Convert each 'Try' into specific, concrete to-do items you can actually complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container-app">
          <h2 className="text-4xl font-bold text-center mb-16">Everything You Need</h2>

          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-3">Simple Interface</h3>
              <p className="text-gray-600">
                Clean, three-column layout makes retrospection effortless and focused
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-3">Action Tracking</h3>
              <p className="text-gray-600">
                Turn insights into concrete actions and track your progress over time
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-3">History & Insights</h3>
              <p className="text-gray-600">
                Review past retrospectives and see your growth journey unfold
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-3">Smart Reminders</h3>
              <p className="text-gray-600">
                Gentle notifications help you build a consistent reflection habit
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-3">Private & Secure</h3>
              <p className="text-gray-600">
                Your reflections are completely private and secure with encryption
              </p>
            </div>

            <div className="text-center">
              <div className="text-5xl mb-4">💾</div>
              <h3 className="text-xl font-semibold mb-3">Data Export</h3>
              <p className="text-gray-600">
                Export your data anytime in JSON, CSV, or PDF format
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-secondary to-secondary-dark text-white">
        <div className="container-app text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Growth Journey?</h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Join Agile Self today and turn your reflections into meaningful action.
            It's free to start!
          </p>
          <Link href="/auth/signup" className="btn bg-white text-secondary hover:bg-gray-100 text-lg px-10 py-4 inline-block">
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-primary text-white">
        <div className="container-app text-center">
          <p className="text-sm opacity-75">
            © 2025 Agile Self. Turn Reflection Into Action.
          </p>
          <div className="mt-4 space-x-6">
            <Link href="/about" className="text-sm hover:text-secondary">About</Link>
            <Link href="/privacy" className="text-sm hover:text-secondary">Privacy</Link>
            <Link href="/terms" className="text-sm hover:text-secondary">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
