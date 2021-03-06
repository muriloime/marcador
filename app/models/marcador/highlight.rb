module Marcador
  class Highlight < ApplicationRecord
    belongs_to :highlightable, polymorphic: true
    belongs_to :user, class_name: 'Ff::User'

    def self.can_add_highlights?(_highlightable, _user)
      true # e.g. highlightable.can_highlight?(user)
    end

    def self.enrich_highlights(user)
      joins(:user)
        .select("marcador_highlights.id as identifier,
                  CONCAT('Highlight by ', user_id) as description,
                  ARRAY[CASE user_id WHEN #{user.id} THEN 'me' ELSE 'others' END] as life_time_class_ends,
                  CASE user_id WHEN #{user.id} THEN true ELSE false END as can_cancel,
                  content,
                  selection_backward as backward,
                  startnode_offset as start_offset,
                  endnode_offset as end_offset,
                  container_node_identifier,
                  container_node_type as common_ancestor_node_type")
    end
  end
end
