require_relative "lib/marcador/version"

Gem::Specification.new do |spec|
  spec.name        = "marcador"
  spec.version     = Marcador::VERSION
  spec.authors     = ["Murilo Vasconcelos"]
  spec.email       = ["muriloime@gmail.com"]
  spec.homepage    = "https://murilo.space"
  spec.summary     = "Rails engine to highlight and persist html content from models"
  spec.description = "Rails engine to highlight and persist html content from models"
  spec.license     = "MIT"
  
  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the "allowed_push_host"
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  # spec.metadata["allowed_push_host"] = "TODO: Set to 'http://mygemserver.com'"

  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/muriloime/marcador"
  spec.metadata["changelog_uri"] = "https://github.com/muriloime/marcador"

  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,db,lib}/**/*", "MIT-LICENSE", "Rakefile", "README.md"]
  end

  spec.add_dependency "rails", ">= 7.0.1"
  spec.add_dependency "importmap-rails", ">= 1.0"
  spec.add_dependency "nokogiri"
end
