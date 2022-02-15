require "marcador/version"
require "marcador/html_node_parser"
require "marcador/model"
require "marcador/engine"

module Marcador
  include ActiveSupport::Configurable
  config_accessor :importmap


  def self.extract_text_from_html(text)
    return nil unless text.is_a? String
    Marcador::HtmlNodeParser.new(text).body_text
  end

  ActiveSupport.on_load(:active_record) do
    extend Model
  end
end
