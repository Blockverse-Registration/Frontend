import InputField from "./InputField";
import SelectField from "./SelectField";

export default function PlayerForm({
  playerData,
  handleChange,
  playerKey,
  errors = {}
}) {
  return (
    <div className="player-section">

    
      <div className="input-group">
        <InputField
          type="text"
          name="name"
          placeholder="Name"
          value={playerData.name || ""}
          onChange={(e) => handleChange(e, playerKey)}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="input-group">
        <InputField
          type="text"
          name="student_no"
          placeholder="Student Number"
          value={playerData.student_no || ""}
          onChange={(e) => handleChange(e, playerKey)}
        />
        {errors.student_no && <span className="error-message">{errors.student_no}</span>}
      </div>

      <div className="input-group">
        <InputField
          type="email"
          name="email"
          placeholder="Email"
          value={playerData.email || ""}
          onChange={(e) => handleChange(e, playerKey)}
          readOnly={true}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <SelectField
        name="year"
        value={playerData.year || ""}
        onChange={(e) => handleChange(e, playerKey)}
        placeholder="Select Year"
        options={[
          { label: "1st Year", value: "1st Year" },
          { label: "2nd Year", value: "2nd Year" }
        ]}
      />

      <SelectField
        name="gender"
        value={playerData.gender || ""}
        onChange={(e) => handleChange(e, playerKey)}
        placeholder="Select Gender"
        options={[
          { label: "Male", value: "MALE" },
          { label: "Female", value: "FEMALE" }
        ]}
      />

      <SelectField
        name="branch"
        value={playerData.branch || ""}
        onChange={(e) => handleChange(e, playerKey)}
        placeholder="Select Branch"
        options={[
          { label: "CSE", value: "CSE" },
          { label: "CSE (AIML)", value: "CSE(AIML)" },
          { label: "CSE (DS)", value: "CSE(DS)" },
          { label: "CS", value: "CS" },
          { label: "AIML", value: "AIML" },
          { label: "IT", value: "IT" },
          { label: "CSIT", value: "CSIT" },
          { label: "ECE", value: "ECE" },
          { label: "EEE", value: "EEE" },
          { label: "ME", value: "ME" },
          { label: "CE", value: "CE" }
        ]}
      />

      <SelectField
        name="residence"
        value={playerData.residence || ""}
        onChange={(e) => handleChange(e, playerKey)}
        placeholder="Select Residence"
        options={[
          { label: "Day Scholar", value: "DayScholar" },
          { label: "Hosteller", value: "Hosteller" }
        ]}
      />

    </div>
  );
}