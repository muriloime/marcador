require "marcador/version"
require "marcador/engine"

module Marcador
  include ActiveSupport::Configurable
  config_accessor :importmap

end
