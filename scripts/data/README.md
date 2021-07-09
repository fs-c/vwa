```
node generate.js <path to benchmark binary> <path to output directory> <tasks to run>
```

The output directory is expected to already exist, existing files might be overwritten in case of a name conflict. The tasks are expected to be a comma (not space!) separated list, refer to `generate.js` for possible task names.

Please refer that this is not intended to be production code. It doesn't have tests, it's not designed or implemented well and it's just bad in general. But it works and it didn't take a lot of time to write; that's what mattered here.
