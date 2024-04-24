port := os.Getenv("PORT")
if port == "" {
    port = "8080"
}

http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, World!")
})

http.ListenAndServe(":"+port, nil)