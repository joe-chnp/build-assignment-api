import express from "express";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = 4001;

app.use(express.json());

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});

app.post("/assignments", async (req, res) => {
  const newAssignment = {
    ...req.body,
    created_at: new Date(),
    updated_at: new Date(),
    published_at: new Date(),
  }
  try {
    await connectionPool.query(
      `insert into assignments (user_id, title, content, category, created_at, updated_at, published_at)
      values ($1, $2, $3, $4, $5, $6, $7)`,
      [
        1,
        newAssignment.title,
        newAssignment.content,
        newAssignment.category,
        newAssignment.created_at,
        newAssignment.updated_at,
        newAssignment.published_at,
      ]
    )
  } catch {
    return res.status(500).json({
      message: "Server could not create assignment because database connection"
    })
  }
  return res.status(201).json({
    message: "Created assignment sucessfully"
  })
});

app.get("/assignments", async (req, res) => {
  let results;
  try {
    results = await connectionPool.query(`select * from assignments`);
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  };
  
  return res.status(200).json({
    data: results.rows
  });
});

app.get("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  let result;
  try {
    result = await connectionPool.query(
      `
      select * from assignments where assignment_id = $1`, [assignmentIdFromClient]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not read assignment because database connection"
    });
  };
  
  if (!result.rows[0]) {
    return res.status(404).json({
      message: "Server could not find a requested assignment"
    });
  }

  return res.status(200).json({
    data: result.rows[0],
  });
});

app.put("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;
  const updatedAssignment = {...req.body, updated_at: new Date()};

  const result = await connectionPool.query(`select * from assignments where assignment_id = $1`, [assignmentIdFromClient]);
  if (!result.rows[0]) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to update"
    })
  }
  
  try{
    await connectionPool.query(
      `
      update assignments
      set title = $2,
          content = $3,
          category = $4,
          updated_at = $5
      where assignment_id = $1
      `,
      [
        assignmentIdFromClient,
        updatedAssignment.title,
        updatedAssignment.content,
        updatedAssignment.category,
        updatedAssignment.updated_at,
      ]
    );
  } catch {
    return res.status(500).json({
      message: "Server could not update assignment because database connection"
    });
  };
  
  return res.status(200).json({
    message: "Updated assignment sucessfully"
  });
});

app.delete("/assignments/:assignmentId", async (req, res) => {
  const assignmentIdFromClient = req.params.assignmentId;

  const result = await connectionPool.query(`select * from assignments where assignment_id = $1`, [assignmentIdFromClient]);
  if (!result.rows[0]) {
    return res.status(404).json({
      message: "Server could not find a requested assignment to delete"
    });
  };

  try {
    await connectionPool.query(`delete from assignments where assignment_id = $1`, [assignmentIdFromClient]);
  } catch {
    return res.status(500).json({
      message: "Server could not delete assignment because database connection"
    });
  };
  
  return res.status(200).json({
    message: "Deleted assignment sucessfully"
  });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
