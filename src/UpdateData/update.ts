import csv from "csv-parser";
import fs from "fs";
import pool from "../../db2.js";
import getResultsFromDatabase from "../utility/getResultsFromDatabase.js";

let assetsWithErrors: string[] = [];
let promises: Promise<void>[] = [];
let similarAssets: Record<string, string[]> = {}

function updateDatabase(data: Record<string, any>): Promise<void> {
  return new Promise((res, rej) => {
    pool.query(
      "UPDATE Asset SET estimatedacquisitioncost = $1 WHERE description ILIKE $2",
      [data['Cost'], data['Description']]
    ).catch((err: any) => {
      console.log("Error Updating data => ", err, data)
      assetsWithErrors.push(data['Description'])
      pool.query(
        "UPDATE Asset SET estimatedacquisitioncost = $1 WHERE description ILIKE $2",
        [0, data['Description']]
      ).catch((err: any) => {
        return res();
      }).then((_: any) => {
        return res();
      });
    }).then((_: any) => {
      return res();
    });
  })
}

function updateSimilarDatabase(data: Record<string, any>): Promise<void> {
  return new Promise((res, rej) => {
    if (data['Cost'] != '') {
      getResultsFromDatabase<{description: string, assetID: number, estimatedacquisitioncost: number}>(
        "SELECT description, assetID, estimatedacquisitioncost FROM Asset WHERE textsearchable_index_col @@ websearch_to_tsquery($1) AND asset.estimatedacquisitioncost = -1",
        [data['Description']]
      ).then((results) => {
        let similarDescriptions = results.map((e) => e.description);
        if(similarAssets[data['Description']]) {
          similarAssets[data['Description']].push(...similarDescriptions)
        } else {
          similarAssets[data['Description']] = similarDescriptions
        }
        pool.query(
          "UPDATE Asset SET estimatedacquisitioncost = $1 WHERE textsearchable_index_col @@ websearch_to_tsquery($2) AND asset.estimatedacquisitioncost = -1",
          [data['Cost'], data['Description']]
        ).catch((err: any) => {
          console.log("Error Updating From Similar data => ", err, data)
          return res();
        }).then((_: any) => {
          return res();
        });
      }).catch((err) => {
        console.log("Error Getting similar assets", err);
        return res();
      })
    } else {
      return res();
    }
  })
}

function updateTrimDatabase(data: Record<string, any>): Promise<void> {
  return new Promise((res, rej) => {
    if (data['Cost'] != '') {
      getResultsFromDatabase<{description: string, assetID: number, estimatedacquisitioncost: number}>(
        "SELECT description, assetID, estimatedacquisitioncost FROM Asset WHERE description % $1 AND asset.estimatedacquisitioncost = -1;",
        [data['Description']]
      ).then((results) => {
        let similarDescriptions = results.map((e) => e.description);
        if(similarAssets[data['Description']]) {
          similarAssets[data['Description']].push(...similarDescriptions)
        } else {
          similarAssets[data['Description']] = similarDescriptions
        }
        pool.query(
          "UPDATE Asset SET estimatedacquisitioncost = $1 WHERE description % $2 AND asset.estimatedacquisitioncost = -1",
          [data['Cost'], data['Description']]
        ).catch((err: any) => {
          console.log("Error Updating From trim data => ", err, data)
          return res();
        }).then((_: any) => {
          return res();
        });
      }).catch((err) => {
        console.log("Error Getting trim assets", err);
        return res();
      })
    } else {
      return res();
    }
  })
}

function updateData(filePath: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      promises.push(updateDatabase(data))
    })
    .on('end', () => {
      console.log("Updates done");
      return res();
    });
  })
}

function updateSimilarData(filePath: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      promises.push(updateSimilarDatabase(data))
    })
    .on('end', () => {
      console.log("Updates done");
      return res();
    });
  })
}

function updateTrimData(filePath: string): Promise<void> {
  return new Promise((res, rej) => {
    fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (data) => {
      promises.push(updateTrimDatabase(data))
    })
    .on('end', () => {
      console.log("Updates done");
      return res();
    });
  })
}

function updateFromRecords(): Promise<void> {
  return new Promise((res, rej) => {
    updateData('busia_unique_items.csv').then(_ => {
      Promise.all(promises).then((_) => {
        updateData('kisian_unique_items.csv').then(_ => {
          Promise.all(promises).then((_) => {
            updateData('hq_unique_items.csv').then(_ => {
              Promise.all(promises).then((_) => {
                updateData('knh_unique_items.csv').then(_ => {
                  Promise.all(promises).then((_) => {
                    updateData('mbagathi_unique_items.csv').then(_ => {
                      Promise.all(promises).then((_) => {
                        updateData('jaramogi_unique_items.csv').then(_ => {
                          Promise.all(promises).then((_) => {
                            console.log("Assets With Errors => ", assetsWithErrors)
                            fs.writeFileSync('./assetsWithErrors.txt', assetsWithErrors.join('\n'))
                            return res();
                          }).catch((err) => {
                            console.log("Error with promise", err);
                          })
                        }).catch((err) => {
                          console.log(err, "Error in function");
                        });
                      }).catch((err) => {
                        console.log("Error with promise", err);
                      })
                    }).catch((err) => {
                      console.log(err, "Error in function");
                    });
                  }).catch((err) => {
                    console.log("Error with promise", err);
                  })
                }).catch((err) => {
                  console.log(err, "Error in function");
                });
              }).catch((err) => {
                console.log("Error with promise", err);
              })
            }).catch((err) => {
              console.log(err, "Error in function");
            });
          }).catch((err) => {
            console.log("Error with promise", err);
          })
        }).catch((err) => {
          console.log(err, "Error in function");
        }); 
      }).catch((err) => {
        console.log("Error with promise", err);
      })
    }).catch((err) => {
      console.log(err, "Error in function");
    }); 
  })
}

function updateFromVectorSearch(): Promise<void> {
  return new Promise((res, rej) => {
    updateSimilarData('busia_unique_items.csv').then(_ => {
      Promise.all(promises).then((_) => {
        updateSimilarData('kisian_unique_items.csv').then(_ => {
          Promise.all(promises).then((_) => {
            updateSimilarData('hq_unique_items.csv').then(_ => {
              Promise.all(promises).then((_) => {
                updateSimilarData('knh_unique_items.csv').then(_ => {
                  Promise.all(promises).then((_) => {
                    updateSimilarData('mbagathi_unique_items.csv').then(_ => {
                      Promise.all(promises).then((_) => {
                        updateSimilarData('jaramogi_unique_items.csv').then(_ => {
                          Promise.all(promises).then((_) => {
                            console.log("Update from full text search done");
                            return res();
                          }).catch((err) => {
                            console.log("Error with promise", err);
                          })
                        }).catch((err) => {
                          console.log(err, "Error in function");
                        });
                      }).catch((err) => {
                        console.log("Error with promise", err);
                      })
                    }).catch((err) => {
                      console.log(err, "Error in function");
                    });
                  }).catch((err) => {
                    console.log("Error with promise", err);
                  })
                }).catch((err) => {
                  console.log(err, "Error in function");
                });
              }).catch((err) => {
                console.log("Error with promise", err);
              })
            }).catch((err) => {
              console.log(err, "Error in function");
            }); 
          }).catch((err) => {
            console.log("Error with promise", err);
          })
        }).catch((err) => {
          console.log(err, "Error in function");
        }); 
      }).catch((err) => {
        console.log("Error with promise", err);
      })
    }).catch((err) => {
      console.log(err, "Error in function");
    });
  })
}

function updateFromTrimSearch(): Promise<void> {
  return new Promise((res, rej) => {
    updateTrimData('busia_unique_items.csv').then(_ => {
      Promise.all(promises).then((_) => {
        updateTrimData('kisian_unique_items.csv').then(_ => {
          Promise.all(promises).then((_) => {
            updateTrimData('hq_unique_items.csv').then(_ => {
              Promise.all(promises).then((_) => {
                updateTrimData('knh_unique_items.csv').then(_ => {
                  Promise.all(promises).then((_) => {
                    updateTrimData('mbagathi_unique_items.csv').then(_ => {
                      Promise.all(promises).then((_) => {
                        updateTrimData('jaramogi_unique_items.csv').then(_ => {
                          Promise.all(promises).then((_) => {
                            let similarAssetsString = JSON.stringify(similarAssets);
                            fs.writeFileSync('./similarAssets.txt', similarAssetsString)
                            console.log("Update From Trim Search Done")
                            return res();
                          }).catch((err) => {
                            console.log("Error with promise", err);
                          })
                        }).catch((err) => {
                          console.log(err, "Error in function");
                        });
                      }).catch((err) => {
                        console.log("Error with promise", err);
                      })
                    }).catch((err) => {
                      console.log(err, "Error in function");
                    });
                  }).catch((err) => {
                    console.log("Error with promise", err);
                  })
                }).catch((err) => {
                  console.log(err, "Error in function");
                });
              }).catch((err) => {
                console.log("Error with promise", err);
              })
            }).catch((err) => {
              console.log(err, "Error in function");
            }); 
          }).catch((err) => {
            console.log("Error with promise", err);
          })
        }).catch((err) => {
          console.log(err, "Error in function");
        }); 
      }).catch((err) => {
        console.log("Error with promise", err);
      })
    }).catch((err) => {
      console.log(err, "Error in function");
    });
  })
}

async function main() {
  updateFromRecords().then((_: any) => {
    updateFromVectorSearch().then((_: any) => {
      updateFromTrimSearch().then((_: any) => {
        console.log("Done!")
      })
    }).catch((err: any) => {
      console.log("Error Updating From Vector", err);
    })
  }).catch((err) => {
    console.log("Error Updating From Records", err);
  })   
}

main()
