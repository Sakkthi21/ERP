import React, { useState, useEffect } from "react";
import CourseTable from "../../shared/ListTable";
import Search from "../../shared/Search";
import axios from "../../../store/axios";
import { errorAlert, successAlert } from "../../../utils";
import DivisionForm from "./DepartmentForm";
import { useDispatch } from "react-redux";
import { setDepartments } from "../../../store/slices/schoolSlice";
const tableHeadings = [
  { id: "createdAt", name: "Created At" },
  { id: "name", name: "Name" },
  { id: "description", name: "Description" },
];

function Division() {
  const [name, setname] = useState("");
  const [searchQuery, setsearchQuery] = useState("");
  const [description, setdescription] = useState("");
  const [loading, setloading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editID, seteditID] = useState("");
  const [addLoading, setaddLoading] = useState(false);
  const [divisions, setdivisions] = useState([]);
  const [storedata, setstoredata] = useState([]);
  const [openEdit, setopenEdit] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    setloading(true);
    axios
      .get("/departments")
      .then((res) => {
        setloading(false);
        setdivisions(res.data);
        setstoredata(res.data);
      })
      .catch((err) => {
        console.log(err);
        setloading(false);
      });
  }, []);

  const inputFields = [
    {
      type: "text",
      label: "Search Name",
      value: searchQuery,
      name: "name",
      onChange: setsearchQuery,
    },
  ];

  const handleDelete = (id) => {
    const ans = window.confirm("are you sure you want to delete");
    if (ans) {
      axios.delete(`/departments/delete/${id}`).then(async (res) => {
        if (res.data.error) {
          errorAlert(res.data.error);
          return 0;
        }
        console.log(divisions, id);
        setdivisions(divisions.filter((e) => e._id !== id));
        let deleted = divisions.find((e) => e._id === id);
        dispatch(setDepartments(divisions.filter((e) => e._id !== id)));
        await axios.post("/activitylog/create", {
          activity: `department ${deleted?.name} was deleted`,
          user: "admin",
        });
      });
    }
  };
  const handleEdit = (id) => {
    setopenEdit(true);
    let division = divisions.find((e) => e._id === id);
    seteditID(id);
    setname(division?.name);
    setdescription(division?.description);
  };

  const handleOpenAdd = () => {
    setOpen(true);
  };

  const handleAddDivision = () => {
    setaddLoading(true);
    axios
      .post("/departments/create", {
        name,
        description,
      })
      .then(async (res) => {
        setaddLoading(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return 0;
        }
        successAlert("Successfully created");
        setOpen(false);
        setname("");
        setdescription("");
        setdivisions([res.data.doc, ...divisions]);
        await axios.post("/activitylog/create", {
          activity: `department ${res.data.doc?.name} was created`,
          user: "admin",
        });
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Failed to add");
        setaddLoading(false);
      });
  };

  const handleEditDivision = () => {
    setaddLoading(true);
    axios
      .put(`/departments/update/${editID}`, {
        name,
        description,
      })
      .then(async (res) => {
        setaddLoading(false);
        if (res.data.error) {
          errorAlert(res.data.error);
          return 0;
        }
        successAlert("Successfully edit");
        setopenEdit(false);
        setname("");
        setdescription("");

        setdivisions(
          divisions.map((i) => (i._id === editID ? res.data.doc : i))
        );
        await axios.post("/activitylog/create", {
          activity: ` ${res.data.doc?.name} department was edited`,
          user: "admin",
        });
      })
      .catch((err) => {
        console.log(err);
        errorAlert("Failed to add");
        setaddLoading(false);
      });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    let newClasses = [];
    if (searchQuery) {
      newClasses = storedata.filter(
        (i) =>
          i?.name.toLowerCase().includes(searchQuery?.toLowerCase()) ||
          i?.description.toLowerCase().includes(searchQuery?.toLowerCase())
      );
    }
    setdivisions(newClasses);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setdivisions(storedata);
    setsearchQuery("");
  };

  return (
    <div>
      <Search
        handleReset={handleReset}
        handleSearch={handleSearch}
        title="Search for a department"
        inputFields={inputFields}
      />

      <div className="content__container">
        <div className="d-flex justify-content-between mb-2">
          <h3>Department List</h3>
          <button onClick={handleOpenAdd} className="btn orange__btn btn__lg">
            Add New Departments
          </button>
        </div>
        <CourseTable
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          data={divisions}
          noData="There are no departments in the database yet"
          handleSearch={handleSearch}
          tableHeader={tableHeadings}
        />
      </div>

      <DivisionForm
        open={openEdit}
        setOpen={setopenEdit}
        loading={addLoading}
        description={description}
        setdescription={setdescription}
        name={name}
        isEdit={true}
        onSubmit={handleEditDivision}
        setname={setname}
      />
      <DivisionForm
        open={open}
        setOpen={setOpen}
        loading={addLoading}
        description={description}
        setdescription={setdescription}
        name={name}
        onSubmit={handleAddDivision}
        setname={setname}
      />
    </div>
  );
}

export default Division;
