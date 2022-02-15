module Marcador
  module Model
    def highlights_on(column_names)
      column_names = [column_names].flatten
      if not column_names.all? {|column_name| self.column_names.include? column_name.to_s}
        raise ArgumentError, "highlights_on: One or more invalid attribute #{column_names}"
      end

      class_eval do
        has_many :highlights, :as => :highlightable, class_name: "Marcador::Highlight"
        before_save :prepare_for_highlights, :if => column_names.map{|column_name| "#{column_name}_changed?".to_sym }
      end

      class_eval %{
        def highlightable_columns
          return #{column_names.map(&:to_s)}
        end
        def prepare_for_highlights
          puts 'prepare'
          #{column_names}.each do |column_name|
            self[column_name.to_sym] = ::Marcador::HtmlNodeParser.new(self[column_name.to_sym]).assign_unique_node_identifiers("data-chnode").body_content
          end
        end
      }
    end
  end
end