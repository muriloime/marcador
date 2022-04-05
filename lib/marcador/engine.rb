module Marcador
  class Engine < ::Rails::Engine
    isolate_namespace Marcador

    initializer 'marcador.importmap', before: 'importmap' do |app|
      app.config.importmap.paths << Engine.root.join('config/importmap.rb')
    end

    initializer :append_migrations do |app|
      unless app.root.to_s.match?(root.to_s)
        config.paths['db/migrate'].expanded.each do |p|
          app.config.paths['db/migrate'] << p
        end
      end
    end
  end
end
