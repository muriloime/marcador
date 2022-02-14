require "marcador/version"
require "marcador/engine"

module Marcador
  include ActiveSupport::Configurable
  config_accessor :importmap

  self.importmap = Importmap::Map.new
end
