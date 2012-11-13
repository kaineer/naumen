%w(jquery backbone).each do |platform|
  system("mkdir -p #{platform}/vendor/js") unless File.directory?("#{platform}/vendor/js")
  
  fi = File.open("./#{platform}/index.html")
  off = File.new("./#{platform}/index.local.html", "w")

  fi.each_line do |line|
    if /src=\"(http:\/\/[^\"]+\/([^\"\/]+\.js))\"/ === line
      of = "#{platform}/vendor/js/#{$~[2]}"
      system("wget #{$~[1]} -O #{of}") unless File.exist?(of)

      off.puts("<script type='text/javascript' src='./vendor/js/#{$~[2]}'></script>")
    else
      off.puts(line)
    end
  end
  off.close
  fi.close
end

