module Marcador
  class Engine < ::Rails::Engine
    isolate_namespace Marcador

    initializer "marcador.importmap", before: "importmap" do |app|
      app.config.importmap.paths << Engine.root.join("config/importmap.rb")
    end
  end
end
