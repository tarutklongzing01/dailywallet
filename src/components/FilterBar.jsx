function FilterBar({ filters, categories, resultCount, onChange, onReset }) {
  const filteredCategories = categories.filter((category) => {
    if (!filters.type || filters.type === 'ทั้งหมด') {
      return true;
    }

    return category.type === filters.type;
  });

  return (
    <section className="panel">
      <div className="panel__header">
        <div>
          <h2>ฟิลเตอร์และค้นหา</h2>
          <p>ค้นหารายการย้อนหลังตามช่วงเวลา ประเภท หมวดหมู่ และรายละเอียด</p>
        </div>
        <span className="result-pill">{resultCount} รายการ</span>
      </div>

      <div className="filter-grid">
        <label className="field">
          <span>ค้นหาจากรายละเอียด</span>
          <input
            type="search"
            placeholder="เช่น ข้าวกลางวัน, ค่าน้ำ, งานฟรีแลนซ์"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
          />
        </label>

        <label className="field">
          <span>ช่วงเวลา</span>
          <select value={filters.period} onChange={(event) => onChange('period', event.target.value)}>
            <option value="all">ทั้งหมด</option>
            <option value="today">วันนี้</option>
            <option value="thisMonth">เดือนนี้</option>
            <option value="day">ระบุวัน</option>
            <option value="month">ระบุเดือน</option>
          </select>
        </label>

        {filters.period === 'day' ? (
          <label className="field">
            <span>เลือกวัน</span>
            <input
              type="date"
              value={filters.selectedDate}
              onChange={(event) => onChange('selectedDate', event.target.value)}
            />
          </label>
        ) : null}

        {filters.period === 'month' ? (
          <label className="field">
            <span>เลือกเดือน</span>
            <input
              type="month"
              value={filters.selectedMonth}
              onChange={(event) => onChange('selectedMonth', event.target.value)}
            />
          </label>
        ) : null}

        <label className="field">
          <span>ประเภท</span>
          <select value={filters.type} onChange={(event) => onChange('type', event.target.value)}>
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="รายรับ">รายรับ</option>
            <option value="รายจ่าย">รายจ่าย</option>
          </select>
        </label>

        <label className="field">
          <span>หมวดหมู่</span>
          <select value={filters.category} onChange={(event) => onChange('category', event.target.value)}>
            <option value="ทั้งหมด">ทั้งหมด</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={`${category.type}||${category.name}`}>
                {category.type} • {category.name}
              </option>
            ))}
          </select>
        </label>

        <div className="field field--action">
          <span>รีเซ็ต</span>
          <button type="button" className="button button--ghost" onClick={onReset}>
            ล้างตัวกรอง
          </button>
        </div>
      </div>
    </section>
  );
}

export default FilterBar;
