for f in $(find ~/home4stay/apps/main-site/src/app -name 'page.tsx'); do
  echo -e "\n--- $f ---"
  head -n 15 "$f"
  echo "--- Lines: $(wc -l < "$f") ---"
done
