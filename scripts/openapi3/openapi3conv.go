package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/getkin/kin-openapi/openapi2"
	"github.com/getkin/kin-openapi/openapi2conv"
	"github.com/getkin/kin-openapi/openapi3"
)

// main This simple script will take the swagger v2 spec generated by grafana and convert them into openapi 3
// saving them as new json file to be able lo load and show
// The first parameter, if present, will be the input file
// The second parameter, if present, will be the output file
func main() {
	outFile := "public/openapi3.json"
	inFile := "api-merged.json"
	args := os.Args[1:]

	// first parameter as the input
	if len(args) > 0 && args[0] != "" {
		inFile = args[0]
	}

	// second parameter as output
	if len(args) > 1 && args[1] != "" {
		outFile = args[1]
	}

	fmt.Printf("Reading swagger 2 file %s\n", inFile)
	byt, err := os.ReadFile(inFile)
	if err != nil {
		panic(err)
	}

	var doc2 openapi2.T
	if err = json.Unmarshal(byt, &doc2); err != nil {
		panic(err)
	}

	doc3, err := openapi2conv.ToV3(&doc2)
	if err != nil {
		panic(err)
	}

	// this is a workaround. In the swagger2 specs there ir no definition of the host, so the converter can not create
	// a URL. Adding this will ensure that all the api calls start with "/api".
	doc3.AddServer(&openapi3.Server{URL: "/api"})

	j3, err := json.MarshalIndent(doc3, "", "  ")
	if err != nil {
		panic(err)
	}

	if err = os.WriteFile(outFile, j3, 0644); err != nil {
		panic(err)
	}
	fmt.Printf("OpenAPI specs generated in file %s\n", outFile)
}
