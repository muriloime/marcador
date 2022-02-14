module Marcador
  class Railtie < Rails::Railtie
    initializer "marcador.assets.precompile" do |app|
      app.config.assets.precompile += %w[marcador/manifest]
    end
  end
end