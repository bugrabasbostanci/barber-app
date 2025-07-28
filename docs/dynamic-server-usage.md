Manage Execution Contexts Correctly: JavaScript operations like setTimeout, setInterval, event handlers, and Promises create new execution contexts. You need to maintain the async context when using these operations. Some strategies include:

Invoke the function that depends on the async context outside of the function that creates a new execution context.

Ensure that you await Promises that invoke a function that depends on async context, otherwise the function may be called after the async operation has completed.
