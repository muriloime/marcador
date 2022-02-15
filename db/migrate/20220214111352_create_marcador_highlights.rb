class CreateMarcadorHighlights < ActiveRecord::Migration[7.0]
  def change
    create_table :marcador_highlights do |t|
      t.references :user, index: true, null: false
      t.references :highlightable, polymorphic: true, index: true, null: false

      t.text :column
      t.text :content
      t.text :container_node_identifier_key
      t.text :container_node_identifier
      t.text :container_node_type
      t.integer :startnode_offset
      t.integer :endnode_offset
      t.boolean :selection_backward
      t.timestamps
    end

    add_index :marcador_highlights, :column
  end
end
