source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

# Specify your gem's dependencies in marcador.gemspec.
gemspec

gem 'pg'

gem 'sprockets-rails'

# Start debugger with binding.b [https://github.com/ruby/debug]
# gem "debug", ">= 1.0.0"

group :development do
  gem 'rubocop'
  gem 'rubocop-performance'
  gem 'rubocop-rails'

  gem 'dotenv-rails'
end

group :development, :test do
  gem 'pry-rails'
end
