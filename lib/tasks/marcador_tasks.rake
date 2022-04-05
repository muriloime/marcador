namespace :marcador do
  task install: :environment do
    # klass = Ff::Summaries::Summary
    klass.all.find_each { |obj| obj.prepare_for_highlights && obj.save }
  end
end
